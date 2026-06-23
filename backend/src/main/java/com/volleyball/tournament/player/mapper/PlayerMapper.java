package com.volleyball.tournament.player.mapper;

import com.volleyball.tournament.player.entity.Address;
import com.volleyball.tournament.player.entity.Player;
import com.volleyball.tournament.player.model.AddressDto;
import com.volleyball.tournament.player.model.PlayerResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlayerMapper {

    @Mapping(target = "fullName", expression = "java(fullName(player))")
    @Mapping(target = "photoUrl", expression = "java(photoUrl(player))")
    @Mapping(target = "hasAccount", source = "hasAccount")
    PlayerResponse toResponse(Player player, boolean hasAccount);

    AddressDto toAddressDto(Address address);

    default String fullName(Player p) {
        StringBuilder sb = new StringBuilder(p.getFirstName());
        if (p.getMiddleName() != null && !p.getMiddleName().isBlank()) {
            sb.append(' ').append(p.getMiddleName());
        }
        return sb.append(' ').append(p.getLastName()).toString();
    }

    default String photoUrl(Player p) {
        return p.getPhotoPath() == null ? null : "/api/players/" + p.getId() + "/photo";
    }
}
