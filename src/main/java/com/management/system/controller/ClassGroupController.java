package com.management.system.controller;

import com.management.system.dto.ClassGroupDTO;
import com.management.system.model.ClassGroup;
import com.management.system.model.Teacher;
import com.management.system.payload.response.MessageResponse;
import com.management.system.repository.TeacherRepository; 
import com.management.system.security.UserDetailsImpl; 
import com.management.system.service.ClassGroupService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder; // 安全上下文
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid; // 验证
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController  
@RequestMapping("/api/classgroups")
public class ClassGroupController {
    
    @Autowired
    private ClassGroupService classGroupService;
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    @GetMapping // Get
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")  //teacher or admin
    public ResponseEntity<List<ClassGroup>> getAllClassGroups() {
        List<ClassGroup> classGroups = classGroupService.getAllClassGroups();
        return ResponseEntity.ok(classGroups);
    }
    
    @GetMapping("/{id}")  // {id} 路径变量
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<?> getClassGroupById(@PathVariable Long id) {
        Optional<ClassGroup> classGroup = classGroupService.getClassGroupById(id);
        if (classGroup.isPresent()) {
            return ResponseEntity.ok(classGroup.get());
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Class group not found"));
        }
    }
    
    @GetMapping("/teacher") 
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getTeacherClassGroups() { 
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); // 获取安全认证
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();  //安全上下方文中拿用户
        
        // 直接使用teacherId查询，避免Teacher对象序列化问题
        List<ClassGroup> classGroups = classGroupService.getClassGroupsByTeacherId(userDetails.getId());
        List<ClassGroupDTO> classGroupDTOs = classGroups.stream()
                .map(ClassGroupDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(classGroupDTOs);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> createClassGroup(@Valid @RequestBody ClassGroup classGroup) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Optional<Teacher> teacher = teacherRepository.findById(userDetails.getId());
        if (teacher.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Teacher not found"));
        }
        
        classGroup.setTeacher(teacher.get()); // 设置教师
        ClassGroup savedClassGroup = classGroupService.createClassGroup(classGroup); //数据入库
        return ResponseEntity.ok(savedClassGroup);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateClassGroup(@PathVariable Long id, @Valid @RequestBody ClassGroup classGroupDetails) {
        Optional<ClassGroup> classGroupOptional = classGroupService.getClassGroupById(id);
        if (classGroupOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Class group not found"));
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ClassGroup classGroup = classGroupOptional.get();
        
        // 检查是否是班级的教师
        if (!classGroup.getTeacher().getId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("You are not authorized to update this class group"));
        }
        
        //更新进行
        classGroup.setName(classGroupDetails.getName()); // 更新名称
        classGroup.setDescription(classGroupDetails.getDescription()); // 更新描述
        
        ClassGroup updatedClassGroup = classGroupService.updateClassGroup(classGroup); 
        return ResponseEntity.ok(updatedClassGroup);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteClassGroup(@PathVariable Long id) {
        Optional<ClassGroup> classGroupOptional = classGroupService.getClassGroupById(id);
        if (classGroupOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Class group not found"));
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ClassGroup classGroup = classGroupOptional.get();
        
        // 管理员或班级教师可以删除班级
        if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ||
                classGroup.getTeacher().getId().equals(userDetails.getId())) {
            classGroupService.deleteClassGroup(id);
            return ResponseEntity.ok(new MessageResponse("Class group deleted successfully"));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("You are not authorized to delete this class group"));
        }
    }
    
    @PostMapping("/{classGroupId}/students/{studentId}")  
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> addStudentToClassGroup(@PathVariable Long classGroupId, @PathVariable Long studentId) { // 添加学生到班级
        Optional<ClassGroup> classGroupOptional = classGroupService.getClassGroupById(classGroupId);
        if (classGroupOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Class group not found"));
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ClassGroup classGroup = classGroupOptional.get();
        
        // 检查是否是班级的教师
        if (!classGroup.getTeacher().getId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("You are not authorized to update this class group"));
        }
        
        classGroupService.addStudentToClassGroup(classGroupId, studentId);
        return ResponseEntity.ok(new MessageResponse("Student added to class group successfully"));
    }
    
    @DeleteMapping("/{classGroupId}/students/{studentId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> removeStudentFromClassGroup(@PathVariable Long classGroupId, @PathVariable Long studentId) { // 删除学生
        Optional<ClassGroup> classGroupOptional = classGroupService.getClassGroupById(classGroupId);
        if (classGroupOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Class group not found"));
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ClassGroup classGroup = classGroupOptional.get();
        
        if (!classGroup.getTeacher().getId().equals(userDetails.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("You are not authorized to update this class group"));
        }
        
        classGroupService.removeStudentFromClassGroup(classGroupId, studentId);
        return ResponseEntity.ok(new MessageResponse("Student removed from class group successfully"));
    }
} 