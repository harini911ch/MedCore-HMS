package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.MedicalRecord;
import com.medcore.medcore_backend.entity.Vital;

import java.time.LocalDateTime;
import java.util.UUID;

public class MedicalRecordResponse {

    private UUID id;
    private UUID hospitalId;
    private UUID patientId;
    private String patientName;
    private UUID doctorId;
    private String doctorName;
    private UUID appointmentId;

    private String chiefComplaints;
    private String symptoms;
    private String diagnoses;
    private String treatmentPlan;
    private String allergies;
    private String vaccinationHistory;
    private String familyHistory;

    private Double temperature;
    private Integer heartRate;
    private Integer systolicBp;
    private Integer diastolicBp;
    private Integer respiratoryRate;
    private Double oxygenSaturation;
    private Double weight;
    private Double height;

    private LocalDateTime createdAt;

    public static MedicalRecordResponse fromEntity(
            MedicalRecord record,
            Vital vital
    ) {
        MedicalRecordResponse response = new MedicalRecordResponse();

        response.id = record.getId();
        response.hospitalId = record.getHospital().getId();
        response.patientId = record.getPatient().getId();
        response.patientName = record.getPatient().getFullName();
        response.doctorId = record.getDoctor().getId();
        response.doctorName = record.getDoctor().getUser().getFullName();

        if (record.getAppointment() != null) {
            response.appointmentId = record.getAppointment().getId();
        }

        response.chiefComplaints = record.getChiefComplaints();
        response.symptoms = record.getSymptoms();
        response.diagnoses = record.getDiagnoses();
        response.treatmentPlan = record.getTreatmentPlan();
        response.allergies = record.getAllergies();
        response.vaccinationHistory = record.getVaccinationHistory();
        response.familyHistory = record.getFamilyHistory();
        response.createdAt = record.getCreatedAt();

        if (vital != null) {
            response.temperature = vital.getTemperature();
            response.heartRate = vital.getHeartRate();
            response.systolicBp = vital.getSystolicBp();
            response.diastolicBp = vital.getDiastolicBp();
            response.respiratoryRate = vital.getRespiratoryRate();
            response.oxygenSaturation = vital.getOxygenSaturation();
            response.weight = vital.getWeight();
            response.height = vital.getHeight();
        }

        return response;
    }

    public UUID getId() {
        return id;
    }

    public UUID getHospitalId() {
        return hospitalId;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public UUID getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public UUID getAppointmentId() {
        return appointmentId;
    }

    public String getChiefComplaints() {
        return chiefComplaints;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public String getDiagnoses() {
        return diagnoses;
    }

    public String getTreatmentPlan() {
        return treatmentPlan;
    }

    public String getAllergies() {
        return allergies;
    }

    public String getVaccinationHistory() {
        return vaccinationHistory;
    }

    public String getFamilyHistory() {
        return familyHistory;
    }

    public Double getTemperature() {
        return temperature;
    }

    public Integer getHeartRate() {
        return heartRate;
    }

    public Integer getSystolicBp() {
        return systolicBp;
    }

    public Integer getDiastolicBp() {
        return diastolicBp;
    }

    public Integer getRespiratoryRate() {
        return respiratoryRate;
    }

    public Double getOxygenSaturation() {
        return oxygenSaturation;
    }

    public Double getWeight() {
        return weight;
    }

    public Double getHeight() {
        return height;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}