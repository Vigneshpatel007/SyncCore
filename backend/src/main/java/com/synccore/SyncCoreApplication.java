package com.synccore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/** Entry point. @SpringBootApplication = configuration + component scan + auto-configuration. */
@SpringBootApplication
@EnableCaching // switches on @Cacheable / @CacheEvict used by ReportService
public class SyncCoreApplication {
    public static void main(String[] args) {
        SpringApplication.run(SyncCoreApplication.class, args);
    }
}
