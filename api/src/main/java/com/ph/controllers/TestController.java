package com.ph.controllers;

import com.ph.services.TestService;
import com.ph.test.Test;
import com.ph.test.TestDto;
import com.ph.test.TestDtoOut;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/test")
public class TestController {

    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @GetMapping()
    public ResponseEntity<List<TestDtoOut>> getTests(){
        return ResponseEntity.ok(
                testService.getTests().stream().map(Test::toDtoOut).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTest(@PathVariable long id){
        Test test = testService.getTest(id);
        if (test != null) {
            return ResponseEntity.ok(testService.getTest(id).toDtoOut());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<String> addTest(@RequestBody TestDto testDto){
        String testId = testService.addTest(testDto.info());
        return ResponseEntity.ok(testId);
    }

}
