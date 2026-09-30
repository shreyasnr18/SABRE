import copy

class VAMAllocator:
    def __init__(self, supply, demand, costs):
        """
        Initializes the VAM allocator.
        :param supply: List of capacities for each peripheral warehouse.
        :param demand: List of demands for each urban dark store.
        :param costs: 2D list (matrix) of shipping costs from warehouse i to store j.
        """
        self.supply = list(supply)
        self.demand = list(demand)
        self.costs = [list(row) for row in costs]
        self.original_supply = list(supply)
        self.original_demand = list(demand)
        self.num_suppliers = len(self.supply)
        self.num_demands = len(self.demand)
        
        self.allocation = []
        self.total_cost = 0

    def balance_network(self):
        """
        Balances the network by adding a dummy source or destination if supply and demand are not equal.
        """
        total_supply = sum(self.supply)
        total_demand = sum(self.demand)
        
        if total_supply > total_demand:
            # Create a dummy destination
            self.demand.append(total_supply - total_demand)
            for row in self.costs:
                row.append(0) # 0 transportation cost to dummy node
            self.num_demands += 1
        elif total_demand > total_supply:
            # Create a dummy source
            self.supply.append(total_demand - total_supply)
            self.costs.append([0] * self.num_demands) # 0 transportation cost from dummy node
            self.num_suppliers += 1
            
        self.allocation = [[0] * self.num_demands for _ in range(self.num_suppliers)]
            
    def _get_penalties(self, active_rows, active_cols):
        """
        Calculates the penalty (difference between lowest and second lowest cost) for active rows and columns.
        """
        row_penalties = {}
        col_penalties = {}
        
        # Row penalties
        for r in active_rows:
            row_costs = [self.costs[r][c] for c in active_cols]
            if len(row_costs) >= 2:
                sorted_costs = sorted(row_costs)
                row_penalties[r] = sorted_costs[1] - sorted_costs[0]
            elif len(row_costs) == 1:
                row_penalties[r] = 0 # Only one cost left, penalty is effectively 0 for tie breaking
            else:
                row_penalties[r] = 0
                
        # Col penalties
        for c in active_cols:
            col_costs = [self.costs[r][c] for r in active_rows]
            if len(col_costs) >= 2:
                sorted_costs = sorted(col_costs)
                col_penalties[c] = sorted_costs[1] - sorted_costs[0]
            elif len(col_costs) == 1:
                col_penalties[c] = 0
            else:
                col_penalties[c] = 0
                
        return row_penalties, col_penalties

    def allocate(self):
        """
        Iteratively allocates supply to demand based on the highest penalty vector.
        """
        active_rows = list(range(self.num_suppliers))
        active_cols = list(range(self.num_demands))
        
        while active_rows and active_cols:
            row_penalties, col_penalties = self._get_penalties(active_rows, active_cols)
            
            max_row_penalty = max(row_penalties.values()) if row_penalties else -1
            max_col_penalty = max(col_penalties.values()) if col_penalties else -1
            
            if max_row_penalty >= max_col_penalty:
                # Target row with highest penalty
                # Break ties by selecting the first occurrence
                r_target = [r for r, p in row_penalties.items() if p == max_row_penalty][0]
                # Pick the column with the minimum cost in this row
                c_target = min(active_cols, key=lambda c: self.costs[r_target][c])
            else:
                # Target column with highest penalty
                c_target = [c for c, p in col_penalties.items() if p == max_col_penalty][0]
                # Pick the row with the minimum cost in this column
                r_target = min(active_rows, key=lambda r: self.costs[r][c_target])
                
            # Determine allocation quantity
            qty = min(self.supply[r_target], self.demand[c_target])
            self.allocation[r_target][c_target] += qty
            self.supply[r_target] -= qty
            self.demand[c_target] -= qty
            self.total_cost += qty * self.costs[r_target][c_target]
            
            # Remove satisfied supplier or demander
            if self.supply[r_target] == 0 and r_target in active_rows:
                active_rows.remove(r_target)
            elif self.demand[c_target] == 0 and c_target in active_cols:
                active_cols.remove(c_target)

    def optimize(self):
        """
        Executes the full VAM process and returns the results.
        """
        self.balance_network()
        self.allocate()
        return {
            "distribution_matrix": self.allocation,
            "total_cost": self.total_cost,
            "dummy_row_added": self.num_suppliers > len(self.original_supply),
            "dummy_col_added": self.num_demands > len(self.original_demand)
        }

def solve_allocation(supply, demand, costs):
    """
    Helper function to instantiate and run VAMAllocator.
    """
    allocator = VAMAllocator(supply, demand, costs)
    return allocator.optimize()
