package com.ph.test;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Test {

    @Id
    @GeneratedValue
    private Long id;

    private String info;

    public Test(String info) {
        this.info = info;
    }

    public TestDtoOut toDtoOut() {
        return new TestDtoOut(id, info);
    }

    public static String getStaticInfo() {
        return "This is ph a test";
    }



}
