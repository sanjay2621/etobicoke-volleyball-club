package com.volleyball.tournament.tournament.mapper;

import com.volleyball.tournament.tournament.entity.Tournament;
import com.volleyball.tournament.tournament.model.TournamentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TournamentMapper {

    @Mapping(target = "draftRounds", expression = "java(tournament.draftRounds())")
    TournamentResponse toResponse(Tournament tournament);
}
