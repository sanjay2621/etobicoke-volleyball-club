package com.volleyball.tournament.schedule.service;

/** A single match-up produced by round-robin generation. */
public record Pairing(int round, Long home, Long away) {
}
