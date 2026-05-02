package com.example.blog.service;

import com.example.blog.dto.CreatePostRequest;
import com.example.blog.dto.PostDTO;
import com.example.blog.dto.UpdatePostRequest;
import com.example.blog.exception.ForbiddenException;
import com.example.blog.exception.ResourceNotFoundException;
import com.example.blog.mapper.PostMapper;
import com.example.blog.model.Notification;
import com.example.blog.model.Post;
import com.example.blog.model.User;
import com.example.blog.repository.PostRepository;
import com.example.blog.security.UserSecurity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;
    private final UserSecurity userSecurity;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final SubscriptionService subscriptionService;

    public PostService(
            PostRepository postRepository,
            UserService userService,
            UserSecurity userSecurity,
            FileStorageService fileStorageService,
            NotificationService notificationService,
            SubscriptionService subscriptionService
    ) {
        this.postRepository = postRepository;
        this.userService = userService;
        this.userSecurity = userSecurity;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
        this.subscriptionService = subscriptionService;
    }

    /* ================= CREATE ================= */

    public PostDTO createPost(@NonNull CreatePostRequest request, MultipartFile media) {
        Long currentUserId = userSecurity.getCurrentUserId();
        if (currentUserId == null) {
            throw new ForbiddenException("You must be authenticated to create a post");
        }

        User user = userService.getUserById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (media != null && !media.isEmpty()) {
            String mediaUrl = fileStorageService.storeFile(media);
            request.setMediaUrl(mediaUrl);

            String contentType = media.getContentType();
            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    request.setMediaType(Post.MediaType.IMAGE);
                } else if (contentType.startsWith("video/")) {
                    request.setMediaType(Post.MediaType.VIDEO);
                }
            }
        }

        Post post = PostMapper.fromCreateRequest(request, user);
        Post savedPost = postRepository.save(post);

        List<Long> subscriberIds = subscriptionService.getSubscriberIds(currentUserId);
        if (!subscriberIds.isEmpty()) {
            notificationService.createNotificationsForUsers(
                subscriberIds,
                user.getUsername() + " published a new post: " + savedPost.getTitle(),
                Notification.NotificationType.NEW_POST,
                savedPost.getId()
            );
        }

        return PostMapper.toDTO(savedPost, currentUserId);
    }

    /* ================= READ ================= */

    /**
     * Paginated list of all posts — avoids loading the entire table into memory.
     * Default page size capped at 100 to prevent abuse.
     */
    @Transactional(readOnly = true)
    public Page<PostDTO> getAllPosts(int page, int size) {
        Long currentUserId = userSecurity.getCurrentUserId();
        boolean isAdmin    = userSecurity.isAdmin();
        int cappedSize     = Math.min(size, 100);
        Pageable pageable  = PageRequest.of(page, cappedSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Post> posts = isAdmin
                ? postRepository.findAll(pageable)
                : postRepository.findByHiddenFalseOrderByCreatedAtDesc(pageable);

        return posts.map(post -> PostMapper.toDTO(post, currentUserId));
    }

    @Transactional(readOnly = true)
    public PostDTO getPostById(@NonNull Long id) {
        Long currentUserId = userSecurity.getCurrentUserId();
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + id + " not found"));
        return PostMapper.toDTO(post, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<PostDTO> getPostsByUserId(@NonNull Long userId) {
        Long currentUserId = userSecurity.getCurrentUserId();
        boolean isAdmin    = userSecurity.isAdmin();

        if (!userService.getUserById(userId).isPresent()) {
            throw new ResourceNotFoundException("User with ID " + userId + " not found");
        }

        List<Post> posts = isAdmin
                ? postRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : postRepository.findByUserIdAndHiddenFalseOrderByCreatedAtDesc(userId);

        return posts.stream()
                .map(post -> PostMapper.toDTO(post, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostDTO> getFeedForCurrentUser() {
        Long currentUserId = userSecurity.getCurrentUserId();
        if (currentUserId == null) {
            throw new ForbiddenException("You must be authenticated to view your feed");
        }

        return postRepository.findPostsBySubscriptions(currentUserId)
                .stream()
                .map(post -> PostMapper.toDTO(post, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> getFeedForCurrentUser(int page, int size) {
        Long currentUserId = userSecurity.getCurrentUserId();
        if (currentUserId == null) {
            throw new ForbiddenException("You must be authenticated to view your feed");
        }

        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findPostsBySubscriptions(currentUserId, pageable)
                .map(post -> PostMapper.toDTO(post, currentUserId));
    }

    /* ================= UPDATE ================= */

    public PostDTO updatePost(@NonNull Long id, @NonNull UpdatePostRequest request, MultipartFile media) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + id + " not found"));

        if (!userSecurity.isOwnerOrAdmin(post.getUser().getId())) {
            throw new ForbiddenException("You don't have permission to update this post");
        }

        if (media != null && !media.isEmpty()) {
            if (post.getMediaUrl() != null) {
                fileStorageService.deleteFile(post.getMediaUrl());
            }

            String mediaUrl = fileStorageService.storeFile(media);
            request.setMediaUrl(mediaUrl);

            String contentType = media.getContentType();
            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    request.setMediaType(Post.MediaType.IMAGE);
                } else if (contentType.startsWith("video/")) {
                    request.setMediaType(Post.MediaType.VIDEO);
                }
            }
        }

        PostMapper.updateFromRequest(post, request);
        Post updatedPost = postRepository.save(post);

        Long currentUserId = userSecurity.getCurrentUserId();
        return PostMapper.toDTO(updatedPost, currentUserId);
    }

    /* ================= HIDE / UNHIDE (admin only) ================= */

    public PostDTO hidePost(@NonNull Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + id + " not found"));
        post.setHidden(true);
        return PostMapper.toDTO(postRepository.save(post), userSecurity.getCurrentUserId());
    }

    public PostDTO unhidePost(@NonNull Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + id + " not found"));
        post.setHidden(false);
        return PostMapper.toDTO(postRepository.save(post), userSecurity.getCurrentUserId());
    }

    /* ================= DELETE ================= */

    public void deletePost(@NonNull Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + id + " not found"));

        if (!userSecurity.isOwnerOrAdmin(post.getUser().getId())) {
            throw new ForbiddenException("You don't have permission to delete this post");
        }

        if (post.getMediaUrl() != null) {
            fileStorageService.deleteFile(post.getMediaUrl());
        }

        postRepository.delete(post);
    }

    /* ================= UTILITY ================= */

    @Transactional(readOnly = true)
    public long countPostsByUser(@NonNull Long userId) {
        return postRepository.countByUserId(userId);
    }
}
