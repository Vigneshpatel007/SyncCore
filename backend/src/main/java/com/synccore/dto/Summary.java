package com.synccore.dto;

import java.math.BigDecimal;

public record Summary(long products, long customers, long suppliers, long employees,
                      long orders, long lowStock, BigDecimal revenue) { }
