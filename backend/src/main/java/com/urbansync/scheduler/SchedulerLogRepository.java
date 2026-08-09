package com.urbansync.scheduler;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchedulerLogRepository
        extends JpaRepository<SchedulerLog, Long> {

    List<SchedulerLog> findTop10ByOrderByRanAtDesc();

    List<SchedulerLog> findByJobNameOrderByRanAtDesc(String jobName);

}