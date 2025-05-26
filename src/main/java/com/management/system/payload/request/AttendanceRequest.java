package com.management.system.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

public class AttendanceRequest {
    @NotNull
    private Long studentId;
    
    @NotNull
    private Long classGroupId;
    
    private boolean present;
    
    private String remarks;
    
    public AttendanceRequest() {
    }
    
    public AttendanceRequest(Long studentId, Long classGroupId, boolean present, String remarks) {
        this.studentId = studentId;
        this.classGroupId = classGroupId;
        this.present = present;
        this.remarks = remarks;
    }
    
    public Long getStudentId() {
        return studentId;
    }
    
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
    
    public Long getClassGroupId() {
        return classGroupId;
    }
    
    public void setClassGroupId(Long classGroupId) {
        this.classGroupId = classGroupId;
    }
    
    public boolean isPresent() {
        return present;
    }
    
    public void setPresent(boolean present) {
        this.present = present;
    }
    
    public String getRemarks() {
        return remarks;
    }
    
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
} 