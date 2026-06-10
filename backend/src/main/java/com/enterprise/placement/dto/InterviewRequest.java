package com.enterprise.placement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewRequest {
    @NotNull
    private Long applicationId;

    @NotNull
    private LocalDateTime scheduledTime;

    private Integer durationMinutes;

    private String mode; // ONLINE, IN_PERSON

    private String venueLink;
}
