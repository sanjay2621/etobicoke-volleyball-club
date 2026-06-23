package com.volleyball.tournament.common;

import java.util.List;
import java.util.stream.Collectors;

/** Minimal RFC-4180-ish CSV helpers: quote fields containing commas, quotes, or newlines. */
public final class CsvUtil {

    private CsvUtil() {
    }

    public static String row(Object... cells) {
        return java.util.Arrays.stream(cells)
                .map(CsvUtil::escape)
                .collect(Collectors.joining(","));
    }

    public static String join(List<String> lines) {
        return String.join("\r\n", lines) + "\r\n";
    }

    private static String escape(Object value) {
        if (value == null) {
            return "";
        }
        String s = String.valueOf(value);
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
