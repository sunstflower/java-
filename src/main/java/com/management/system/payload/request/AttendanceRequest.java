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
    
} 