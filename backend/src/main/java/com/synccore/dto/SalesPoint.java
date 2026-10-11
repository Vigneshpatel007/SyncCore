package com.synccore.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesPoint(LocalDate date, BigDecimal revenue, Long orders) { }
