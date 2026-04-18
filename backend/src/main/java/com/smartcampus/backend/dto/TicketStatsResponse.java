package com.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatsResponse {
    private Map<String, Long> statusCounts;
    private Map<String, Long> priorityCounts;
    private Map<String, Long> categoryCounts;
    private Map<String, Long> dailyTrends;
    private Map<String, Long> locationUsage;
    private long totalTickets;
    private long resolvedTickets;
    private double resolutionRate;
}
