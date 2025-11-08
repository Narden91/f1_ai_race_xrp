# Initialize (importing the module runs FHEService() once)
from server_fhe_race import create_car, get_car_velocity_kmh, race_winner, train_car_random_subset

car1 = create_car("Alpha")
car2 = create_car("Bravo")
car3 = create_car("Charlie")

print(get_car_velocity_kmh(car1))  # -> (S_norm, kmh)
print(get_car_velocity_kmh(car2))
print(get_car_velocity_kmh(car3))

print(race_winner([car1, car2, car3]))

car4 = create_car("Falcon")

# Player picks t0, t1, t3, t5; server samples deltas uniformly in [-20, +20], encrypts, and applies:
car5 = train_car_random_subset(car4, [0, 1, 3, 5], delta_max=20)

print(get_car_velocity_kmh(car4))
print(get_car_velocity_kmh(car5))

print(race_winner([car1, car2, car3, car4, car5]))
