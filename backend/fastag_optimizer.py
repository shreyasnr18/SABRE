from datetime import datetime, timedelta

class TariffOptimizer:
    def __init__(self, dispatches, toll_plazas, margin_hrs=2.0):
        """
        Initializes the dynamic FASTag tariff optimizer.
        
        :param dispatches: List of dictionaries containing dispatch details.
               Expected keys: 'trip_id', 'outbound_departure_time', 'return_departure_time', 
                              'plaza_id', 'outbound_travel_hrs_to_plaza', 'return_travel_hrs_to_plaza'
        :param toll_plazas: Dictionary of toll plaza rate structures.
               Expected format: { 'plaza_id': {'single_rate': float, 'return_rate': float} }
        :param margin_hrs: The maximum allowed shift in hours to capture the discount.
        """
        self.dispatches = dispatches
        self.toll_plazas = toll_plazas
        self.margin_hrs = margin_hrs
        
    def optimize_schedule(self):
        """
        Calculates toll costs and shifts return dispatch windows to capture the 24-hour return discount.
        
        :return: Tuple (optimized_schedule, total_expense, net_savings)
        """
        optimized_schedule = []
        total_expense_original = 0
        total_expense_optimized = 0
        
        for dispatch in self.dispatches:
            trip_id = dispatch.get('trip_id')
            plaza_id = dispatch.get('plaza_id')
            
            if not plaza_id or plaza_id not in self.toll_plazas:
                # No toll plaza interaction
                optimized_schedule.append({
                    "trip_id": trip_id,
                    "outbound_departure_time": dispatch['outbound_departure_time'],
                    "return_departure_time": dispatch['return_departure_time'],
                    "toll_expense": 0,
                    "shift_hrs": 0,
                    "discount_applied": False
                })
                continue
                
            plaza_info = self.toll_plazas[plaza_id]
            single_rate = plaza_info['single_rate']
            return_rate = plaza_info['return_rate']
            
            outbound_dep = dispatch['outbound_departure_time']
            return_dep = dispatch['return_departure_time']
            
            # Calculate crossing times
            outbound_crossing = outbound_dep + timedelta(hours=dispatch['outbound_travel_hrs_to_plaza'])
            return_crossing = return_dep + timedelta(hours=dispatch['return_travel_hrs_to_plaza'])
            
            diff_hrs = (return_crossing - outbound_crossing).total_seconds() / 3600.0
            
            original_cost = 0
            optimized_cost = 0
            shift_hrs = 0
            discount_applied = False
            optimized_return_dep = return_dep
            
            # Original Cost calculation
            if diff_hrs <= 24.0:
                original_cost = return_rate
            else:
                original_cost = single_rate * 2
                
            # Optimized Cost calculation
            if diff_hrs <= 24.0:
                optimized_cost = return_rate
                discount_applied = True
            elif 24.0 < diff_hrs <= (24.0 + self.margin_hrs):
                optimized_cost = return_rate
                shift_hrs = diff_hrs - 24.0
                optimized_return_dep -= timedelta(hours=shift_hrs)
                discount_applied = True
            else:
                optimized_cost = single_rate * 2
                discount_applied = False
                
            total_expense_original += original_cost
            total_expense_optimized += optimized_cost
            
            optimized_schedule.append({
                "trip_id": trip_id,
                "outbound_departure_time": outbound_dep,
                "return_departure_time": optimized_return_dep,
                "original_return_departure_time": return_dep,
                "toll_expense": optimized_cost,
                "shift_hrs": shift_hrs,
                "discount_applied": discount_applied
            })
            
        net_savings = total_expense_original - total_expense_optimized
        
        return optimized_schedule, total_expense_optimized, net_savings

def optimize_fastag_tariffs(dispatches, toll_plazas, margin_hrs=2.0):
    optimizer = TariffOptimizer(dispatches, toll_plazas, margin_hrs)
    return optimizer.optimize_schedule()
