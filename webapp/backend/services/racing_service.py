import random
import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import xrpl
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment
from xrpl.utils import xrp_to_drops

class Car:
    
    ATTRIBUTE_NAMES = [
        'tyres',        # 0: Tyre quality
        'brakes',       # 1: Brake performance
        'engine',       # 2: Engine power
        'aerodynamics', # 3: Aerodynamic efficiency
        'suspension',   # 4: Suspension quality
        'transmission', # 5: Transmission efficiency
        'fuel_system',  # 6: Fuel system optimization
        'electronics',  # 7: Electronic systems
        'chassis',      # 8: Chassis rigidity
        'cooling'       # 9: Cooling system
    ]
    
    def __init__(self, car_id: str, wallet_address: str):
        self.car_id = car_id
        self.wallet_address = wallet_address
        self.flags = [random.randint(1, 999) for _ in range(10)]
        self.training_count = 0
        self.created_at = datetime.utcnow().isoformat()
        self.last_trained = None
        self.last_speed = None
        
        base_weights = [0.15, 0.12, 0.10, 0.08, 0.11, 0.09, 0.13, 0.07, 0.08, 0.07]
        self.weights = [w + random.uniform(-0.02, 0.02) for w in base_weights]
        total = sum(self.weights)
        self.weights = [w / total for w in self.weights]
        
    def calculate_speed(self) -> float:
        raw_speed = sum(f * w for f, w in zip(self.flags, self.weights))
        
        min_raw, max_raw = 100, 900
        min_speed, max_speed = 150, 350
        
        speed = min_speed + (raw_speed - min_raw) * (max_speed - min_speed) / (max_raw - min_raw)
        
        speed = max(min_speed, min(max_speed, speed))
        
        self.last_speed = speed
        return speed
    
    def train(self, attribute_indices: Optional[List[int]] = None) -> dict:
        if attribute_indices is None or len(attribute_indices) == 0:
            attribute_indices = list(range(10))
        
        changes = {}
        for i in attribute_indices:
            if 0 <= i < 10:
                old_value = self.flags[i]
                delta = random.randint(-20, 20)
                new_value = max(1, min(999, self.flags[i] + delta))
                self.flags[i] = new_value
                changes[self.ATTRIBUTE_NAMES[i]] = {
                    'old': old_value,
                    'delta': delta,
                    'new': new_value
                }
        
        self.training_count += 1
        self.last_trained = datetime.utcnow().isoformat()
        
        self.last_speed = None
        
        return changes
    
    def to_dict_safe(self) -> dict:
        return {
            'car_id': self.car_id,
            'wallet_address': self.wallet_address,
            'training_count': self.training_count,
            'created_at': self.created_at,
            'last_trained': self.last_trained
        }

class RacingService:
    
    PAYMENT_DESTINATION = "rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY"
    TESTNET_URL = "https://s.altnet.rippletest.net:51234"
    
    def __init__(self):
        self.cars: Dict[str, Car] = {}
        self.garage: Dict[str, List[str]] = {}
        self.races: List[dict] = []
    
    def _process_payment(self, wallet_seed: str, amount_xrp: float) -> Tuple[bool, str]:
        return True, f"DEMO-TX-{random.randint(100000, 999999)}"
        
    def _generate_car_id(self, wallet_address: str) -> str:
        timestamp = datetime.utcnow().timestamp()
        data = f"{wallet_address}{timestamp}{random.random()}"
        hash_id = hashlib.sha256(data.encode()).hexdigest()[:12]
        return f"CAR-{hash_id}"
    
    def create_car(self, wallet_address: str, wallet_seed: str) -> Tuple[bool, Optional[Car], str]:
        payment_success, payment_result = self._process_payment(wallet_seed, 1.0)
        
        if not payment_success:
            return False, None, f"Payment failed: {payment_result}"
        
        car_id = self._generate_car_id(wallet_address)
        car = Car(car_id, wallet_address)
        
        self.cars[car_id] = car
        
        if wallet_address not in self.garage:
            self.garage[wallet_address] = []
        self.garage[wallet_address].append(car_id)
        
        return True, car, f"Car created successfully. Payment tx: {payment_result}"
    
    def get_garage(self, wallet_address: str) -> List[Car]:
        car_ids = self.garage.get(wallet_address, [])
        return [self.cars[cid] for cid in car_ids if cid in self.cars]
    
    def get_car(self, car_id: str) -> Optional[Car]:
        return self.cars.get(car_id)
    
    def train_car(self, car_id: str, wallet_address: str, wallet_seed: str, attribute_indices: Optional[List[int]] = None) -> Tuple[bool, str, Optional[Car], Optional[dict]]:
        base_car = self.cars.get(car_id)
        
        if not base_car:
            return False, "Car not found", None, None
        
        if base_car.wallet_address != wallet_address:
            return False, "You don't own this car", None, None
        
        payment_success, payment_result = self._process_payment(wallet_seed, 1.0)
        
        if not payment_success:
            return False, f"Payment failed: {payment_result}", None, None
        
        new_car_id = self._generate_car_id(wallet_address)
        new_car = Car(new_car_id, wallet_address)
        
        new_car.flags = base_car.flags.copy()
        new_car.weights = base_car.weights.copy()
        new_car.training_count = base_car.training_count
        
        base_speed = base_car.last_speed if base_car.last_speed is not None else base_car.calculate_speed()
        
        changes = new_car.train(attribute_indices)
        
        new_speed = new_car.calculate_speed()
        new_car.last_speed = new_speed
        
        self.cars[new_car_id] = new_car
        
        if wallet_address not in self.garage:
            self.garage[wallet_address] = []
        self.garage[wallet_address].append(new_car_id)
        
        if attribute_indices:
            trained_attrs = [new_car.ATTRIBUTE_NAMES[i] for i in attribute_indices if 0 <= i < 10]
            attr_msg = f"Trained: {', '.join(trained_attrs)}"
        else:
            attr_msg = "Trained: All attributes"
        
        return True, f"New car created from training (Training #{new_car.training_count}). {attr_msg}. Payment tx: {payment_result}", new_car, changes
    
    def test_speed(self, car_id: str, wallet_address: str) -> Tuple[bool, bool, str, Optional[float]]:
        car = self.cars.get(car_id)
        
        if not car:
            return False, False, "Car not found", None
        
        if car.wallet_address != wallet_address:
            return False, False, "You don't own this car", None
        
        current_speed = car.calculate_speed()
        
        if car.last_speed is None:
            car.last_speed = current_speed
            improved = False
            message = f"Baseline speed: {current_speed:.2f} km/h"
        else:
            speed_diff = current_speed - car.last_speed
            improved = speed_diff > 0
            
            if speed_diff > 0:
                message = f"🚀 Speed improved! {car.last_speed:.2f} → {current_speed:.2f} km/h (+{speed_diff:.2f})"
            elif speed_diff < 0:
                message = f"⚠️ Speed decreased: {car.last_speed:.2f} → {current_speed:.2f} km/h ({speed_diff:.2f})"
            else:
                message = f"Speed unchanged: {current_speed:.2f} km/h"
            
            car.last_speed = current_speed
        
        return True, improved, message, current_speed
    
    def enter_race(self, car_id: str, wallet_address: str, wallet_seed: str) -> Tuple[bool, Optional[dict]]:
        car = self.cars.get(car_id)
        
        if not car:
            return False, None
        
        if car.wallet_address != wallet_address:
            return False, None
        
        payment_success, payment_result = self._process_payment(wallet_seed, 1.0)
        
        if not payment_success:
            return False, {'message': f"Payment failed: {payment_result}"}
        
        num_opponents = random.randint(3, 7)
        
        player_speed = car.calculate_speed()
        
        opponents = []
        for i in range(num_opponents):
            ai_id = f"AI-{i+1}"
            ai_speed = random.uniform(30, 70)
            opponents.append({'id': ai_id, 'speed': ai_speed})
        
        all_racers = [{'id': car_id, 'speed': player_speed, 'is_player': True}]
        all_racers.extend([{**opp, 'is_player': False} for opp in opponents])
        
        all_racers.sort(key=lambda x: x['speed'], reverse=True)
        
        player_rank = next(i + 1 for i, r in enumerate(all_racers) if r.get('is_player'))
        
        winner_id = all_racers[0]['id']
        prize_awarded = winner_id == car_id
        
        race_id = f"RACE-{datetime.utcnow().timestamp()}"
        
        race_result = {
            'race_id': race_id,
            'car_id': car_id,
            'your_rank': player_rank,
            'winner_car_id': winner_id,
            'total_participants': len(all_racers),
            'prize_awarded': prize_awarded,
            'timestamp': datetime.utcnow().isoformat(),
            'payment_tx': payment_result
        }
        
        self.races.append(race_result)
        
        return True, race_result
    
    def sell_car(self, car_id: str, wallet_address: str) -> Tuple[bool, str, float]:
        car = self.cars.get(car_id)
        
        if not car:
            return False, "Car not found", 0.0
        
        if car.wallet_address != wallet_address:
            return False, "You don't own this car", 0.0
        
        if wallet_address in self.garage and car_id in self.garage[wallet_address]:
            self.garage[wallet_address].remove(car_id)
        
        del self.cars[car_id]
        
        refund_amount = 0.5
        
        return True, f"Car {car_id} sold for {refund_amount} XRP", refund_amount

racing_service = RacingService()
