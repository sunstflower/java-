package com.management.system.payload.request;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceRequest { //出席の请求DTO
    @NotNull 
    private Long studentId;
    
    @NotNull
    private Long classGroupId;
    
    private boolean present;
    
    private String remarks;

    /* {
     *  "studentId": 学生ID,
     *  "classGroupId": 班级ID,
     *  "present": 是否出席,
     *  "remarks": 备注
     * }
     */
 
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