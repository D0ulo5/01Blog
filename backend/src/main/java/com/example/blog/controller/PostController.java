package com.example.blog.controller;

import com.example.blog.dto.CreatePostRequest;
import com.example.blog.dto.PostDTO;
import com.example.blog.dto.UpdatePostRequest;
import com.example.blog.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    /* ================= CREATE ================= */

    @PreAuthorize("isAuthenticated()")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDTO> createPost(
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart(value = "media", required = false) MultipartFile media
    ) {
        CreatePostRequest request = new CreatePostRequest();
        request.setTitle(title);
        request.setContent(content);

        PostDTO created = postService.createPost(request, media);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /* ================= READ ================= */

    /**
     * GET /api/posts?page=0&size=20
     * Returns a page of posts. Capped at 100 per request server-side.
     */
    @GetMapping
    public ResponseEntity<Page<PostDTO>> getAllPosts(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(postService.getAllPosts(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable @NonNull Long id) {
        PostDTO post = postService.getPostById(id);
        // Hidden posts are only visible to admins
        if (post.isHidden()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(post);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUser(@PathVariable @NonNull Long userId) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/feed")
    public ResponseEntity<List<PostDTO>> getFeed() {
        return ResponseEntity.ok(postService.getFeedForCurrentUser());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/feed/page")
    public ResponseEntity<Page<PostDTO>> getFeedPaginated(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getFeedForCurrentUser(page, size));
    }

    /* ================= UPDATE ================= */

    @PreAuthorize("isAuthenticated()")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable @NonNull Long id,
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart(value = "media", required = false) MultipartFile media
    ) {
        UpdatePostRequest request = new UpdatePostRequest();
        request.setTitle(title);
        request.setContent(content);

        return ResponseEntity.ok(postService.updatePost(id, request, media));
    }

    /* ================= DELETE ================= */

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable @NonNull Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/admin")
    public ResponseEntity<Void> adminDeletePost(@PathVariable @NonNull Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/hide")
    public ResponseEntity<PostDTO> hidePost(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(postService.hidePost(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/unhide")
    public ResponseEntity<PostDTO> unhidePost(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(postService.unhidePost(id));
    }
}
