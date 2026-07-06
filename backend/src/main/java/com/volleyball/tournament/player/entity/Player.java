package com.volleyball.tournament.player.entity;

import com.volleyball.tournament.common.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "player")
@SQLRestriction("deleted = false")
public class Player extends BaseEntity {

    @Column(name = "tournament_id", nullable = false)
    private Long tournamentId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;

    @Column(name = "photo_data")
    private byte[] photoData;

    @Column(name = "photo_content_type", length = 50)
    private String photoContentType;

    @Embedded
    private Address address = new Address();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "player_position", joinColumns = @JoinColumn(name = "player_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "position", nullable = false, length = 20)
    private Set<Position> preferredPositions = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "tshirt_size", nullable = false, length = 8)
    private TshirtSize tshirtSize;

    // --- Recommended extras ---
    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", length = 20)
    private SkillLevel skillLevel;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Column(name = "jersey_number_preference")
    private Integer jerseyNumberPreference;

    @Column(name = "waiver_accepted", nullable = false)
    private boolean waiverAccepted = false;

    @Column(name = "photo_consent", nullable = false)
    private boolean photoConsent = false;

    @Column(name = "dietary_notes")
    private String dietaryNotes;

    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 12)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(length = 1000)
    private String notes;

    /** True for admin-created players who never went through public registration. */
    @Column(name = "manual_entry", nullable = false)
    private boolean manualEntry = false;
}
