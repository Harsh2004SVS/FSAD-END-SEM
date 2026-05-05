package com.example.demo;

import com.example.demo.model.Match;
import com.example.demo.repository.MatchRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(MatchRepository matchRepository) {
		return args -> {
			if (matchRepository.count() == 0) {
				System.out.println("Seeding initial cricket matches...");
				
				Match m1 = new Match();
				m1.setTeam1("India"); m1.setTeam2("Australia");
				m1.setDate("2026-10-15 14:00"); m1.setVenue("Wankhede Stadium, Mumbai");
				m1.setTicketPrice(2500.0); m1.setTotalTickets(30000); m1.setAvailableTickets(30000);
				
				Match m2 = new Match();
				m2.setTeam1("England"); m2.setTeam2("New Zealand");
				m2.setDate("2026-10-18 10:00"); m2.setVenue("Lord's, London");
				m2.setTicketPrice(3000.0); m2.setTotalTickets(25000); m2.setAvailableTickets(25000);
				
				Match m3 = new Match();
				m3.setTeam1("South Africa"); m3.setTeam2("Pakistan");
				m3.setDate("2026-10-22 18:00"); m3.setVenue("Wanderers Stadium, Johannesburg");
				m3.setTicketPrice(1800.0); m3.setTotalTickets(20000); m3.setAvailableTickets(20000);
				
				Match m4 = new Match();
				m4.setTeam1("India"); m4.setTeam2("Pakistan");
				m4.setDate("2026-11-05 14:00"); m4.setVenue("Narendra Modi Stadium, Ahmedabad");
				m4.setTicketPrice(5000.0); m4.setTotalTickets(100000); m4.setAvailableTickets(100000);
				
				matchRepository.save(m1);
				matchRepository.save(m2);
				matchRepository.save(m3);
				matchRepository.save(m4);
			}
		};
	}
}
