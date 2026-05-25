package com.loanengine.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
@Profile("prod")
@Slf4j
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        String rawUrl = firstNonBlank(
                env.getProperty("SPRING_DATASOURCE_URL"),
                env.getProperty("DATABASE_URL"));

        if (rawUrl == null) {
            throw new IllegalStateException(
                    "Database URL missing on Render. Set SPRING_DATASOURCE_URL or DATABASE_URL. " +
                            "Example: jdbc:postgresql://ep-xxx.neon.tech:5432/neondb?sslmode=require");
        }

        String username = firstNonBlank(
                env.getProperty("SPRING_DATASOURCE_USERNAME"),
                env.getProperty("DB_USERNAME"));
        String password = firstNonBlank(
                env.getProperty("SPRING_DATASOURCE_PASSWORD"),
                env.getProperty("DB_PASSWORD"));

        String jdbcUrl = toJdbcUrl(rawUrl);
        if (jdbcUrl.startsWith("jdbc:postgresql://") && (username == null || password == null)) {
            var parsed = parsePostgresUrl(rawUrl);
            if (username == null)
                username = parsed.username();
            if (password == null)
                password = parsed.password();
            jdbcUrl = parsed.jdbcUrl();
        }

        if (!jdbcUrl.contains("sslmode=")) {
            jdbcUrl += (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=require";
        }

        log.info("Connecting to database host: {}", extractHost(jdbcUrl));

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setDriverClassName("org.postgresql.Driver");
        if (username != null)
            config.setUsername(username);
        if (password != null)
            config.setPassword(password);
        config.setMaximumPoolSize(5);
        config.setConnectionTimeout(30_000);
        config.addDataSourceProperty("sslmode", "require");

        try {
            return new HikariDataSource(config);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Cannot connect to Neon. Use the POOLED connection string from Neon dashboard " +
                            "(host must contain '-pooler'). Also verify DB_USERNAME and DB_PASSWORD.",
                    e);
        }
    }

    private static String extractHost(String jdbcUrl) {
        try {
            return URI.create(jdbcUrl.replace("jdbc:", "")).getHost();
        } catch (Exception e) {
            return "unknown";
        }
    }

    static String toJdbcUrl(String url) {
        String trimmed = url.trim();
        if (trimmed.startsWith("jdbc:postgresql://") || trimmed.startsWith("jdbc:postgres://")) {
            return trimmed;
        }
        if (trimmed.startsWith("postgresql://")) {
            return "jdbc:" + trimmed;
        }
        if (trimmed.startsWith("postgres://")) {
            return "jdbc:postgresql:" + trimmed.substring("postgres://".length());
        }
        return trimmed;
    }

    private static ParsedUrl parsePostgresUrl(String url) {
        try {
            String normalized = url.trim()
                    .replace("jdbc:postgresql://", "postgresql://")
                    .replace("jdbc:postgres://", "postgresql://")
                    .replace("postgres://", "postgresql://");

            URI uri = URI.create(normalized);
            String userInfo = uri.getUserInfo();
            String user = null;
            String pass = null;
            if (userInfo != null && !userInfo.isBlank()) {
                String[] parts = userInfo.split(":", 2);
                user = decode(parts[0]);
                if (parts.length > 1)
                    pass = decode(parts[1]);
            }

            String query = uri.getRawQuery();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String jdbc = "jdbc:postgresql://" + uri.getHost() + ":" + port
                    + uri.getPath()
                    + (query != null && !query.isBlank() ? "?" + query : "?sslmode=require");

            return new ParsedUrl(jdbc, user, pass);
        } catch (Exception e) {
            return new ParsedUrl(toJdbcUrl(url), null, null);
        }
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private record ParsedUrl(String jdbcUrl, String username, String password) {
    }
}
