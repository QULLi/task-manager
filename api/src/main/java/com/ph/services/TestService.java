package com.ph.services;

import com.ph.repositories.TestRepo;
import com.ph.test.Test;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestService {

    private final TestRepo testRepo;


    public TestService(TestRepo testRepo) {
        this.testRepo = testRepo;
    }

    public String getTestResponse () {
        return testRepo.getTestResponse();
    }

    public String addTest(String info) {
        Test test = testRepo.save(new Test(info));
        return test.getId().toString();
    }

    public List<Test> getTests() {
        return testRepo.findAll();
    }

    public Test getTest(long id) {
        return testRepo.findById(id).orElse(null);
    }
}
