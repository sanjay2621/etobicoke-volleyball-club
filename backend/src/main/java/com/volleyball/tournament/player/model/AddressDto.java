package com.volleyball.tournament.player.model;

public record AddressDto(
        String line1,
        String line2,
        String city,
        String province,
        String postalCode,
        String country) {

    public String countryOrDefault() {
        return (country == null || country.isBlank()) ? "Canada" : country;
    }
}
