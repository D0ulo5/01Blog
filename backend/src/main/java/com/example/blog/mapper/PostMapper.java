package com.example.blog.mapper;

import com.example.blog.dto.CreatePostRequest;
import com.example.blog.dto.PostDTO;
import com.example.blog.dto.UpdatePostRequest;
import com.example.blog.model.Post;
import com.example.blog.model.User;

public final class PostMapper {

    private PostMapper() {}

    /**
     * Convert Post entity to PostDTO
     */
    public static PostDTO toDTO(Post post) {
        if (post == null) return null;

        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setUserId(post.getUser().getId());
        dto.setUsername(post.getUser().getUsername());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setMediaUrl(post.getMediaUrl());
        dto.setMediaType(post.getMediaType());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        
        // Set engagement metrics
        dto.setLikeCount(post.getLikes() != null ? post.getLikes().size() : 0);
        dto.setCommentCount(post.getComments() != null ? post.getComments().size() : 0);
        dto.setLikedByCurrentUser(false);
        dto.setHidden(post.isHidden());

        return dto;
    }

    /**
     * Convert Post to DTO with current user like status
     */
    public static PostDTO toDTO(Post post, Long currentUserId) {
        PostDTO dto = toDTO(post);
        
        if (dto != null && currentUserId != null && post.getLikes() != null) {
            boolean isLiked = post.getLikes().stream()
                .anyMatch(like -> like.getUser().getId().equals(currentUserId));
            dto.setLikedByCurrentUser(isLiked);
        }
        
        return dto;
    }

    /**
     * Create Post entity from CreatePostRequest
     */
    public static Post fromCreateRequest(CreatePostRequest request, User user) {
        if (request == null || user == null) return null;

        Post post = new Post();
        post.setUser(user);
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setMediaUrl(request.getMediaUrl());
        post.setMediaType(request.getMediaType());

        return post;
    }

    /**
     * Update Post entity from UpdatePostRequest
     */
    public static void updateFromRequest(Post post, UpdatePostRequest request) {
        if (post == null || request == null) return;

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getMediaUrl() != null) {
            post.setMediaUrl(request.getMediaUrl());
        }
        if (request.getMediaType() != null) {
            post.setMediaType(request.getMediaType());
        }
    }
}
