#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <algorithm>
#include <cmath>

/**
 * ============================================================================
 * S.A.B.R.E. HIGH-PERFORMANCE C++ COMPUTATIONAL CORE
 * Module: National Toll Corridor & FASTag Ledger Engine
 * Author: SABRE Core Architecture Team
 * Compilation: g++ -O3 -std=c++17 -o toll_engine toll_corridor_engine.cpp
 * ============================================================================
 */

struct TollRate {
    double car;
    double lcv;
    double truck_2axle;
    double commercial_3axle;
    double mav_4to6axle;
    double odc_7plus;
    double return_discount_pct; // e.g. 25% to 50%
};

struct TollPlaza {
    std::string id;
    std::string name;
    std::string highway;
    std::string state;
    double chainage_km;
    std::string operator_name;
    int fastag_lanes;
    bool has_wim; // Weigh-in-motion sensor
    TollRate rates;
};

struct Corridor {
    std::string id;
    std::string name;
    std::string primary_highway;
    std::string origin;
    std::string destination;
    double total_distance_km;
    std::vector<TollPlaza> plazas;
};

class TollCorridorEngine {
private:
    std::unordered_map<std::string, Corridor> corridor_database;

    void initialize_national_corridors() {
        // ====================================================================
        // 1. NH-48: DELHI - MUMBAI - BANGALORE - CHENNAI (WESTERN ARTERY)
        // ====================================================================
        Corridor nh48;
        nh48.id = "CORR-NH48-DEL-MUM";
        nh48.name = "Delhi - Jaipur - Ahmedabad - Mumbai Western Freight Spine";
        nh48.primary_highway = "NH-48";
        nh48.origin = "Delhi NCR";
        nh48.destination = "Mumbai (JNPT)";
        nh48.total_distance_km = 1420.0;

        nh48.plazas = {
            {"PLZ-101", "Kherki Daula", "NH-48", "Haryana", 42.0, "Delhi-Gurgaon Concess.", 16, true, {80, 115, 235, 255, 370, 450, 33.3}},
            {"PLZ-102", "Shahjahanpur", "NH-48", "Rajasthan", 132.5, "Pink City Tollway", 14, true, {165, 265, 530, 580, 830, 1010, 25.0}},
            {"PLZ-103", "Manoharpur", "NH-48", "Rajasthan", 210.0, "IRB Infrastructure", 12, true, {85, 140, 280, 305, 440, 535, 30.0}},
            {"PLZ-104", "Kishangarh (Thikariya)", "NH-48", "Rajasthan", 345.0, "GVK Tollways", 12, true, {75, 120, 245, 270, 385, 470, 25.0}},
            {"PLZ-105", "Rupangarh", "NH-48", "Rajasthan", 430.0, "National Highway Auth", 10, true, {60, 95, 195, 215, 305, 370, 25.0}},
            {"PLZ-106", "Negadiya (Bhilwara)", "NH-48", "Rajasthan", 512.0, "L&T Tollway", 12, true, {110, 175, 350, 380, 550, 670, 25.0}},
            {"PLZ-107", "Kherwara", "NH-48", "Rajasthan", 640.0, "IRB Surat-Dahisar", 10, true, {95, 150, 300, 330, 470, 570, 33.3}},
            {"PLZ-108", "Samakhyali Bypass (Shamlaji)", "NH-48", "Gujarat", 710.0, "Gujarat State Toll", 12, true, {80, 130, 260, 285, 410, 500, 25.0}},
            {"PLZ-109", "Radhvanaj (Kheda)", "NH-48", "Gujarat", 860.0, "Torrent Infrastructure", 14, true, {105, 170, 340, 370, 530, 645, 25.0}},
            {"PLZ-110", "Vasad (Anand)", "NH-48", "Gujarat", 910.0, "L&T Vadodara Bharuch", 14, true, {135, 220, 440, 480, 690, 840, 25.0}},
            {"PLZ-111", "Bharuch Narmada Bridge", "NH-48", "Gujarat", 995.0, "IRB Infrastructure", 12, true, {90, 145, 290, 315, 455, 550, 30.0}},
            {"PLZ-112", "Boriach (Navsari)", "NH-48", "Gujarat", 1080.0, "Surat Tollway Ltd", 12, true, {85, 135, 275, 300, 430, 520, 25.0}},
            {"PLZ-113", "Bhagwada (Vapi)", "NH-48", "Gujarat", 1165.0, "IRB Surat-Dahisar", 14, true, {95, 155, 310, 340, 485, 590, 25.0}},
            {"PLZ-114", "Charoti (Palghar)", "NH-48", "Maharashtra", 1245.0, "IRB Infrastructure", 16, true, {90, 145, 290, 315, 455, 550, 25.0}},
            {"PLZ-115", "Khaniwade (Virar)", "NH-48", "Maharashtra", 1330.0, "Mumbai Metro Infra", 16, true, {95, 150, 305, 335, 480, 580, 25.0}}
        };
        corridor_database[nh48.id] = nh48;

        // ====================================================================
        // 2. NH-44: NORTH-SOUTH CORRIDOR (DELHI - HYDERABAD - BANGALORE)
        // ====================================================================
        Corridor nh44;
        nh44.id = "CORR-NH44-DEL-BLR";
        nh44.name = "North-South Mega Freight Corridor (Delhi - Hyderabad - Bangalore)";
        nh44.primary_highway = "NH-44";
        nh44.origin = "Delhi NCR";
        nh44.destination = "Bangalore Electronic City";
        nh44.total_distance_km = 2170.0;

        nh44.plazas = {
            {"PLZ-201", "Murthal (Sonipat)", "NH-44", "Haryana", 50.0, "National Highway Auth", 16, true, {70, 110, 220, 240, 345, 420, 25.0}},
            {"PLZ-202", "Panipat Elevated Expressway", "NH-44", "Haryana", 86.0, "L&T Panipat Toll", 12, true, {45, 75, 150, 165, 235, 285, 25.0}},
            {"PLZ-203", "Gharaunda (Karnal)", "NH-44", "Haryana", 114.0, "Soma Tollways", 14, true, {130, 210, 420, 460, 655, 795, 25.0}},
            {"PLZ-204", "Shambhu (Ambala)", "NH-44", "Punjab", 212.0, "GMR Ambala-Chandigarh", 14, true, {85, 140, 280, 305, 435, 530, 33.3}},
            {"PLZ-205", "Dholpur Plaza", "NH-44", "Rajasthan", 310.0, "IRB Infrastructure", 10, true, {75, 120, 245, 265, 380, 465, 25.0}},
            {"PLZ-206", "Babina (Jhansi)", "NH-44", "Uttar Pradesh", 480.0, "NHAI Operations", 10, true, {90, 145, 290, 320, 455, 550, 25.0}},
            {"PLZ-207", "Malthone (Sagar)", "NH-44", "Madhya Pradesh", 590.0, "MP Road Development", 12, true, {105, 170, 340, 370, 530, 640, 25.0}},
            {"PLZ-208", "Titarpani (Narsinghpur)", "NH-44", "Madhya Pradesh", 750.0, "NHAI Jabalpur", 10, true, {115, 185, 370, 405, 580, 700, 25.0}},
            {"PLZ-209", "Mansar (Nagpur North)", "NH-44", "Maharashtra", 980.0, "Oriental Pathways", 12, true, {95, 150, 305, 335, 480, 580, 25.0}},
            {"PLZ-210", "Kelapur (Yavatmal)", "NH-44", "Maharashtra", 1150.0, "IL&FS Transportation", 10, true, {85, 135, 270, 295, 425, 515, 25.0}},
            {"PLZ-211", "Pippalwada (Adilabad)", "NH-44", "Telangana", 1240.0, "Telangana State Toll", 12, true, {90, 145, 290, 315, 455, 550, 25.0}},
            {"PLZ-212", "Indalwai (Nizamabad)", "NH-44", "Telangana", 1370.0, "GMR Hyderabad Toll", 14, true, {100, 160, 320, 350, 500, 610, 25.0}},
            {"PLZ-213", "Rawoor (Shadnagar)", "NH-44", "Telangana", 1580.0, "GMR Jadcherla Express", 12, true, {95, 155, 310, 340, 485, 590, 25.0}},
            {"PLZ-214", "Pullur (Kurnool)", "NH-44", "Andhra Pradesh", 1750.0, "AP Road Development", 12, true, {110, 175, 355, 385, 555, 675, 25.0}},
            {"PLZ-215", "Marur (Anantapur)", "NH-44", "Andhra Pradesh", 1920.0, "L&T Anantapur Express", 12, true, {125, 200, 400, 440, 625, 760, 25.0}},
            {"PLZ-216", "Bagepalli (Chikkaballapur)", "NH-44", "Karnataka", 2080.0, "Navayuga Devanahalli", 16, true, {105, 165, 330, 360, 515, 625, 25.0}}
        };
        corridor_database[nh44.id] = nh44;

        // ====================================================================
        // 3. HINDU HRUDAYSAMRAT BALASAHEB THACKERAY SAMRUDDHI MAHAMARG
        // ====================================================================
        Corridor samruddhi;
        samruddhi.id = "CORR-EXP-SAMRUDDHI";
        samruddhi.name = "Mumbai - Shirdi - Aurangabad - Nagpur Super Communication Expressway";
        samruddhi.primary_highway = "Samruddhi Mahamarg (MSX-1)";
        samruddhi.origin = "Mumbai (Thane JN)";
        samruddhi.destination = "Nagpur (MIHAN SEZ)";
        samruddhi.total_distance_km = 701.0;

        samruddhi.plazas = {
            {"PLZ-301", "Igatpuri Main Toll Plaza", "MSX-1", "Maharashtra", 65.0, "MSRDC Closed Tollway", 16, true, {145, 235, 470, 515, 735, 895, 20.0}},
            {"PLZ-302", "Sinnar Interchange", "MSX-1", "Maharashtra", 160.0, "MSRDC Express", 12, true, {110, 180, 360, 395, 565, 685, 20.0}},
            {"PLZ-303", "Kopargaon (Shirdi Exit)", "MSX-1", "Maharashtra", 230.0, "MSRDC Express", 14, true, {95, 155, 310, 340, 485, 590, 20.0}},
            {"PLZ-304", "Aurangabad West (Shendra)", "MSX-1", "Maharashtra", 340.0, "MSRDC High-Speed", 16, true, {160, 260, 520, 570, 815, 990, 20.0}},
            {"PLZ-305", "Jalna Industrial Interchange", "MSX-1", "Maharashtra", 415.0, "MSRDC Express", 12, true, {105, 170, 340, 375, 535, 650, 20.0}},
            {"PLZ-306", "Karanja (Washim Hub)", "MSX-1", "Maharashtra", 520.0, "MSRDC Express", 12, true, {130, 210, 420, 460, 660, 800, 20.0}},
            {"PLZ-307", "Wardha East Interchange", "MSX-1", "Maharashtra", 625.0, "MSRDC Express", 14, true, {120, 195, 390, 430, 610, 740, 20.0}},
            {"PLZ-308", "Nagpur MIHAN Terminal Plaza", "MSX-1", "Maharashtra", 695.0, "MSRDC Terminal", 18, true, {150, 245, 490, 540, 770, 935, 20.0}}
        };
        corridor_database[samruddhi.id] = samruddhi;

        // ====================================================================
        // 4. NH-16: EAST COAST FREIGHT CORRIDOR (KOLKATA - CHENNAI)
        // ====================================================================
        Corridor nh16;
        nh16.id = "CORR-NH16-KOL-CHE";
        nh16.name = "East Coast Maritime Freight Artery (Kolkata - Vizag - Chennai)";
        nh16.primary_highway = "NH-16";
        nh16.origin = "Kolkata (Dankuni)";
        nh16.destination = "Chennai Port";
        nh16.total_distance_km = 1660.0;

        nh16.plazas = {
            {"PLZ-401", "Dhulagarh", "NH-16", "West Bengal", 28.0, "NHAI Kolkata Hub", 14, true, {95, 150, 305, 335, 480, 580, 25.0}},
            {"PLZ-402", "Debra (Kharagpur)", "NH-16", "West Bengal", 112.0, "Ashoka Buildcon", 12, true, {115, 185, 370, 405, 580, 700, 25.0}},
            {"PLZ-403", "Baleshwar (Balasore)", "NH-16", "Odisha", 240.0, "GMR OSE Tollways", 12, true, {90, 145, 290, 315, 455, 550, 25.0}},
            {"PLZ-404", "Panikoili (Jajpur)", "NH-16", "Odisha", 370.0, "PNC Infratech", 12, true, {105, 170, 340, 370, 530, 645, 25.0}},
            {"PLZ-405", "Manguli (Cuttack)", "NH-16", "Odisha", 460.0, "NHAI Bhubaneswar", 14, true, {120, 195, 390, 430, 610, 740, 25.0}},
            {"PLZ-406", "Gangapada (Khurda)", "NH-16", "Odisha", 520.0, "L&T Odisha Tollway", 12, true, {85, 135, 275, 300, 430, 520, 25.0}},
            {"PLZ-407", "Palasa (Srikakulam)", "NH-16", "Andhra Pradesh", 710.0, "Navayuga Palasa", 12, true, {100, 160, 320, 350, 500, 610, 25.0}},
            {"PLZ-408", "Aganampudi (Vizag Steel)", "NH-16", "Andhra Pradesh", 880.0, "Visakhapatnam Port Exp", 14, true, {75, 120, 240, 265, 380, 460, 25.0}},
            {"PLZ-409", "Kalaparru (Eluru)", "NH-16", "Andhra Pradesh", 1110.0, "Gammon Infrastructure", 12, true, {110, 175, 350, 385, 550, 670, 25.0}},
            {"PLZ-410", "Tanguturu (Ongole)", "NH-16", "Andhra Pradesh", 1330.0, "NHAI Vijayawada", 14, true, {130, 210, 420, 460, 655, 795, 25.0}},
            {"PLZ-411", "Budhanam (Nellore)", "NH-16", "Andhra Pradesh", 1490.0, "Swarna Tollway", 12, true, {105, 165, 330, 360, 515, 625, 25.0}},
            {"PLZ-412", "Gummidipoondi", "NH-16", "Tamil Nadu", 1610.0, "Tamil Nadu Road Dev.", 16, true, {90, 145, 290, 315, 455, 550, 25.0}}
        };
        corridor_database[nh16.id] = nh16;
    }

public:
    TollCorridorEngine() {
        initialize_national_corridors();
    }

    std::string get_corridors_json() {
        std::ostringstream ss;
        ss << "[\n";
        bool first = true;
        for (const auto& [id, corr] : corridor_database) {
            if (!first) ss << ",\n";
            first = false;
            ss << "  {\n"
               << "    \"id\": \"" << corr.id << "\",\n"
               << "    \"name\": \"" << corr.name << "\",\n"
               << "    \"primary_highway\": \"" << corr.primary_highway << "\",\n"
               << "    \"origin\": \"" << corr.origin << "\",\n"
               << "    \"destination\": \"" << corr.destination << "\",\n"
               << "    \"total_distance_km\": " << corr.total_distance_km << ",\n"
               << "    \"plaza_count\": " << corr.plazas.size() << "\n"
               << "  }";
        }
        ss << "\n]";
        return ss.str();
    }

    std::string calculate_route_toll(
        const std::string& corridor_id,
        const std::string& vehicle_class,
        bool is_round_trip,
        double overload_tonnes
    ) {
        auto start_clock = std::chrono::high_resolution_clock::now();

        if (corridor_database.find(corridor_id) == corridor_database.end()) {
            return "{\"status\": \"ERROR\", \"message\": \"Corridor not found.\"}";
        }

        const Corridor& corr = corridor_database[corridor_id];
        double base_toll_sum = 0.0;
        double return_discount_sum = 0.0;
        double overload_penalty_sum = 0.0;

        // Overload penalty calculation under Section 113 of Indian Motor Vehicles Act:
        // Overloading incurs minimum 2x to 10x penalty tariff on the basic toll rate
        double overload_multiplier = 0.0;
        if (overload_tonnes > 0.0) {
            if (overload_tonnes <= 2.0) overload_multiplier = 2.0;       // 2x basic toll
            else if (overload_tonnes <= 5.0) overload_multiplier = 4.0;  // 4x basic toll
            else overload_multiplier = 10.0;                             // 10x basic toll for severe overload
        }

        std::ostringstream plazas_json;
        plazas_json << "[\n";

        for (size_t i = 0; i < corr.plazas.size(); ++i) {
            const TollPlaza& p = corr.plazas[i];
            double single_rate = 0.0;

            if (vehicle_class == "car") single_rate = p.rates.car;
            else if (vehicle_class == "lcv") single_rate = p.rates.lcv;
            else if (vehicle_class == "truck_2axle") single_rate = p.rates.truck_2axle;
            else if (vehicle_class == "commercial_3axle") single_rate = p.rates.commercial_3axle;
            else if (vehicle_class == "mav_4to6axle") single_rate = p.rates.mav_4to6axle;
            else if (vehicle_class == "odc_7plus") single_rate = p.rates.odc_7plus;
            else single_rate = p.rates.mav_4to6axle; // Default MAV

            double effective_rate = single_rate;
            double discount = 0.0;

            if (is_round_trip) {
                discount = single_rate * (p.rates.return_discount_pct / 100.0);
                effective_rate = (single_rate * 2.0) - discount;
            }

            double plaza_overload_fine = single_rate * overload_multiplier;

            base_toll_sum += single_rate;
            return_discount_sum += discount;
            overload_penalty_sum += plaza_overload_fine;

            if (i > 0) plazas_json << ",\n";
            plazas_json << "    {\n"
                        << "      \"id\": \"" << p.id << "\",\n"
                        << "      \"name\": \"" << p.name << "\",\n"
                        << "      \"highway\": \"" << p.highway << "\",\n"
                        << "      \"state\": \"" << p.state << "\",\n"
                        << "      \"chainage_km\": " << p.chainage_km << ",\n"
                        << "      \"operator\": \"" << p.operator_name << "\",\n"
                        << "      \"fastag_lanes\": " << p.fastag_lanes << ",\n"
                        << "      \"has_wim_sensor\": " << (p.has_wim ? "true" : "false") << ",\n"
                        << "      \"single_journey_inr\": " << single_rate << ",\n"
                        << "      \"round_trip_discount_inr\": " << discount << ",\n"
                        << "      \"effective_charged_inr\": " << effective_rate << ",\n"
                        << "      \"overload_penalty_inr\": " << plaza_overload_fine << "\n"
                        << "    }";
        }
        plazas_json << "\n  ]";

        double grand_total_inr = (is_round_trip ? (base_toll_sum * 2.0 - return_discount_sum) : base_toll_sum) + overload_penalty_sum;

        auto end_clock = std::chrono::high_resolution_clock::now();
        std::chrono::duration<double, std::milli> elapsed = end_clock - start_clock;

        std::ostringstream out;
        out << std::fixed << std::setprecision(2);
        out << "{\n"
            << "  \"status\": \"SUCCESS\",\n"
            << "  \"engine_version\": \"SABRE C++ High-Speed Math Core v2.4-O3\",\n"
            << "  \"compute_time_ms\": " << elapsed.count() << ",\n"
            << "  \"corridor_id\": \"" << corr.id << "\",\n"
            << "  \"corridor_name\": \"" << corr.name << "\",\n"
            << "  \"highway\": \"" << corr.primary_highway << "\",\n"
            << "  \"origin\": \"" << corr.origin << "\",\n"
            << "  \"destination\": \"" << corr.destination << "\",\n"
            << "  \"total_distance_km\": " << corr.total_distance_km << ",\n"
            << "  \"vehicle_class\": \"" << vehicle_class << "\",\n"
            << "  \"is_round_trip\": " << (is_round_trip ? "true" : "false") << ",\n"
            << "  \"overload_tonnes\": " << overload_tonnes << ",\n"
            << "  \"plazas_count\": " << corr.plazas.size() << ",\n"
            << "  \"financial_summary\": {\n"
            << "    \"base_single_journey_toll_inr\": " << base_toll_sum << ",\n"
            << "    \"return_trip_savings_inr\": " << return_discount_sum << ",\n"
            << "    \"weigh_in_motion_overload_fine_inr\": " << overload_penalty_sum << ",\n"
            << "    \"grand_total_fastag_deduction_inr\": " << grand_total_inr << ",\n"
            << "    \"recommended_fastag_buffer_inr\": " << (grand_total_inr * 1.15) << "\n"
            << "  },\n"
            << "  \"plazas\": " << plazas_json.str() << "\n"
            << "}";

        return out.str();
    }
};

int main(int argc, char* argv[]) {
    TollCorridorEngine engine;

    if (argc < 2) {
        std::cout << "{\"error\": \"Usage: ./toll_engine <command> [args...]\"}\n";
        return 1;
    }

    std::string cmd = argv[1];

    if (cmd == "list-corridors") {
        std::cout << engine.get_corridors_json() << std::endl;
        return 0;
    }

    if (cmd == "calculate") {
        std::string corridor = (argc > 2) ? argv[2] : "CORR-NH48-DEL-MUM";
        std::string vclass = (argc > 3) ? argv[3] : "mav_4to6axle";
        bool round_trip = (argc > 4 && std::string(argv[4]) == "1");
        double overload = (argc > 5) ? std::stod(argv[5]) : 0.0;

        std::cout << engine.calculate_route_toll(corridor, vclass, round_trip, overload) << std::endl;
        return 0;
    }

    std::cout << "{\"error\": \"Unknown command: " << cmd << "\"}\n";
    return 1;
}
