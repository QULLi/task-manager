package com.ph.repositories;

import com.ph.test.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepo extends JpaRepository<Test, Long> {

    public default String getTestResponse() {
        return Test.getStaticInfo();
    }

}
