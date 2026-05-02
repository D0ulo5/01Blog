package com.example.blog.dto;

import com.example.blog.model.Post;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {

    private Long id;
    private Long userId;
    private String username;
    private String title;
    private String content;
    private String mediaUrl;
    private Post.MediaType mediaType;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Engagement metrics
    private int likeCount;
    private int commentCount;
    
    // For authenticated users
    private boolean likedByCurrentUser;
    
    // Moderation
    private boolean hidden;
}
