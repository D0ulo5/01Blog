package com.example.blog.model;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "reports",
    indexes = {
        @Index(columnList = "reported_user_id"),
        @Index(columnList = "reported_post_id"),
        @Index(columnList = "status"),
        @Index(columnList = "created_at")
    }
)
public class Report {

    public enum ReportStatus {
        PENDING,
        RESOLVED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(
        name = "reporter_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_report_reporter")
    )
    private User reporter;

    @ManyToOne(optional = false)
    @JoinColumn(
        name = "reported_user_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_report_reported_user")
    )
    private User reportedUser;

    // SET NULL so reports survive post deletion (e.g. when the post's author is deleted).
    // The report remains as an admin record; the post reference just becomes null.
    @ManyToOne
    @JoinColumn(
        name = "reported_post_id",
        foreignKey = @ForeignKey(name = "fk_report_reported_post")
    )
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Post reportedPost;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }

    public User getReportedUser() { return reportedUser; }
    public void setReportedUser(User reportedUser) { this.reportedUser = reportedUser; }

    public Post getReportedPost() { return reportedPost; }
    public void setReportedPost(Post reportedPost) { this.reportedPost = reportedPost; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
