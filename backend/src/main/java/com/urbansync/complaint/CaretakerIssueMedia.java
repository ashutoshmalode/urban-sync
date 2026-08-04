package com.urbansync.complaint;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "caretaker_issue_media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaretakerIssueMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private CaretakerIssue issue;

    @Column(name = "media_url", nullable = false, length = 500)
    private String mediaUrl;

    @Column(name = "media_type", nullable = false, length = 10)
    private String mediaType;

    @Column(name = "uploaded_by", nullable = false, length = 20)
    private String uploadedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}