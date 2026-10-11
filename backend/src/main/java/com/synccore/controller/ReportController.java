package com.synccore.controller;

import com.synccore.dto.SalesPoint;
import com.synccore.dto.Summary;
import com.synccore.dto.TopProduct;
import com.synccore.service.ReportService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

/** Revenue figures are sensitive, so the whole controller is admin-only. */
@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {
    private final ReportService service;

    public ReportController(ReportService service) { this.service = service; }

    @GetMapping("/summary")
    public Summary summary() { return service.summary(); }

    @GetMapping("/sales-by-date")
    public List<SalesPoint> salesByDate() { return service.salesByDate(); }

    @GetMapping("/top-products")
    public List<TopProduct> topProducts() { return service.topProducts(); }
}
