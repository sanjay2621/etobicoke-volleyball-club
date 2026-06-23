package com.volleyball.tournament.player.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class Address {

    @Column(name = "address_line1")
    private String line1;

    @Column(name = "address_line2")
    private String line2;

    @Column(name = "address_city")
    private String city;

    @Column(name = "address_province")
    private String province;

    @Column(name = "address_postal_code")
    private String postalCode;

    @Column(name = "address_country")
    private String country = "Canada";
}
