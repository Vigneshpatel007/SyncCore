package com.synccore.dto;

import java.math.BigDecimal;

public record TopProduct(String name, Long unitsSold, BigDecimal revenue) { }
