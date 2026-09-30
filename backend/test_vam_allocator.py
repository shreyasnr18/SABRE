import unittest
from vam_allocator import solve_allocation

class TestVAMAllocator(unittest.TestCase):
    def test_balanced_network(self):
        supply = [300, 400, 500]
        demand = [250, 350, 400, 200]
        # Total supply: 1200, Total demand: 1200
        costs = [
            [3, 1, 7, 4],
            [2, 6, 5, 9],
            [8, 3, 3, 2]
        ]
        
        result = solve_allocation(supply, demand, costs)
        
        self.assertFalse(result["dummy_row_added"])
        self.assertFalse(result["dummy_col_added"])
        
        # Verify constraints (supply exhausted, demand met)
        alloc = result["distribution_matrix"]
        
        for i in range(len(supply)):
            self.assertEqual(sum(alloc[i]), supply[i])
            
        for j in range(len(demand)):
            col_sum = sum(alloc[i][j] for i in range(len(supply)))
            self.assertEqual(col_sum, demand[j])

    def test_unbalanced_supply_greater(self):
        supply = [400, 400, 500] # Total 1300
        demand = [250, 350, 400, 200] # Total 1200
        costs = [
            [3, 1, 7, 4],
            [2, 6, 5, 9],
            [8, 3, 3, 2]
        ]
        
        result = solve_allocation(supply, demand, costs)
        
        self.assertFalse(result["dummy_row_added"])
        self.assertTrue(result["dummy_col_added"]) # Dummy destination added
        
        alloc = result["distribution_matrix"]
        
        # Dummy col should have exactly 100 allocated
        dummy_col_sum = sum(alloc[i][-1] for i in range(len(supply)))
        self.assertEqual(dummy_col_sum, 100)
        
    def test_unbalanced_demand_greater(self):
        supply = [300, 400, 400] # Total 1100
        demand = [250, 350, 400, 200] # Total 1200
        costs = [
            [3, 1, 7, 4],
            [2, 6, 5, 9],
            [8, 3, 3, 2]
        ]
        
        result = solve_allocation(supply, demand, costs)
        
        self.assertTrue(result["dummy_row_added"]) # Dummy source added
        self.assertFalse(result["dummy_col_added"]) 
        
        alloc = result["distribution_matrix"]
        
        # Dummy row should have exactly 100 allocated
        dummy_row_sum = sum(alloc[-1])
        self.assertEqual(dummy_row_sum, 100)

if __name__ == '__main__':
    unittest.main()
