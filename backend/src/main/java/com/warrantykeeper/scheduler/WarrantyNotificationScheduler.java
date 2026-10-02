package com.warrantykeeper.scheduler;

import com.warrantykeeper.service.NotificationService;
import io.quarkus.runtime.StartupEvent;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import java.time.LocalDate;
import org.jboss.logging.Logger;

@ApplicationScoped
public class WarrantyNotificationScheduler {

    private static final Logger LOG = Logger.getLogger(WarrantyNotificationScheduler.class);

    @Inject
    NotificationService notificationService;

    /** Runs daily at 08:00 server time. */
    @Scheduled(cron = "0 0 8 * * ?", identity = "warranty-expiry-notifications")
    void runDaily() {
        run();
    }

    /** Catch-up on startup in case the app was down at 08:00; safe because the job is idempotent. */
    void onStart(@Observes StartupEvent event) {
        try {
            run();
        } catch (RuntimeException e) {
            LOG.warn("Startup notification check failed", e);
        }
    }

    private void run() {
        int created = notificationService.createExpiringTomorrow(LocalDate.now());
        LOG.infof("Warranty notification job finished, %d new notification(s)", created);
    }
}
