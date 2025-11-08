#!/usr/bin/env python3
"""
F1-AI Game Demo with GUI
IXH25 - Track 1: Advanced Cryptography

A graphical game demo showcasing homomorphic encryption-based F1 racing.
Player controls one car, competes against 5 AI opponents.
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import threading
import time
from server_fhe_race import (
    create_car,
    get_car_velocity_kmh,
    race_winner,
    train_car_random_subset,
    N,
    PRINT_LOG
)

# Game constants
STARTING_XPF = 10
TRAIN_COST = 1
RACE_COST = 1
RACE_REWARD = 100
NUM_AI_OPPONENTS = 5

class ProgressDialog:
    """A progress dialog with indeterminate progress bar"""
    def __init__(self, parent, title, message):
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("500x150")
        self.dialog.resizable(False, False)
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Center the dialog
        self.dialog.update_idletasks()
        x = parent.winfo_x() + (parent.winfo_width() // 2) - (500 // 2)
        y = parent.winfo_y() + (parent.winfo_height() // 2) - (150 // 2)
        self.dialog.geometry(f"+{x}+{y}")
        
        # Content
        frame = ttk.Frame(self.dialog, padding="25")
        frame.pack(fill=tk.BOTH, expand=True)
        
        self.label = ttk.Label(frame, text=message, font=('Helvetica', 13, 'bold'))
        self.label.pack(pady=(0, 18))
        
        self.progress = ttk.Progressbar(frame, mode='indeterminate', length=450)
        self.progress.pack(pady=12)
        self.progress.start(10)
        
        self.status_label = ttk.Label(frame, text="", font=('Helvetica', 11), foreground='gray')
        self.status_label.pack(pady=(8, 0))
        
    def update_status(self, status):
        """Update the status text"""
        self.status_label.config(text=status)
        self.dialog.update()
        
    def close(self):
        """Close the progress dialog"""
        self.progress.stop()
        self.dialog.grab_release()
        self.dialog.destroy()


class RaceAnimationWindow:
    """2D animated race visualization"""
    def __init__(self, parent, race_data):
        """
        race_data: list of dicts with 'name', 'velocity', 'car_id', 'is_player'
        """
        self.window = tk.Toplevel(parent)
        self.window.title("🏁 Race Animation")
        self.window.geometry("1000x650")
        self.window.resizable(False, False)
        self.window.transient(parent)
        
        # Race data
        self.race_data = sorted(race_data, key=lambda x: x['velocity'], reverse=True)
        self.num_cars = len(self.race_data)
        
        # Animation parameters
        self.track_length = 900  # pixels
        self.finish_line = self.track_length
        self.start_line = 50
        self.race_distance = self.finish_line - self.start_line
        
        # Calculate acceleration for each car based on velocity
        # Using physics: v_max is the target velocity, we simulate acceleration
        self.car_positions = [0.0] * self.num_cars
        self.car_velocities = [0.0] * self.num_cars  # Current velocity (starts at 0)
        self.car_max_velocities = [car['velocity'] for car in self.race_data]
        
        # Normalize velocities so the fastest reaches finish line in reasonable time
        max_v = max(self.car_max_velocities)
        # Scale so fastest car takes about 5 seconds
        self.time_scale = 0.02  # seconds per frame
        self.acceleration_rate = [v / max_v * 2.0 for v in self.car_max_velocities]
        
        # Race state
        self.race_finished = False
        self.winner_index = None
        self.animation_id = None
        
        # Setup UI
        self.setup_ui()
        
        # Start race after a short delay
        self.window.after(500, self.start_race)
    
    def setup_ui(self):
        """Create the race track UI"""
        # Title
        title_label = tk.Label(self.window, text="🏁 RACE IN PROGRESS 🏁", 
                              font=('Helvetica', 24, 'bold'))
        title_label.pack(pady=15)
        
        # Canvas for race track
        self.canvas = tk.Canvas(self.window, width=1000, height=500, bg='#2a2a2a')
        self.canvas.pack(pady=10)
        
        # Draw track lanes
        lane_height = 500 // self.num_cars
        colors = ['#FF4444', '#4444FF', '#44FF44', '#FFFF44', '#FF44FF', '#44FFFF']
        
        for i in range(self.num_cars):
            y = i * lane_height
            car_data = self.race_data[i]
            
            # Lane background
            lane_color = '#3a3a3a' if i % 2 == 0 else '#2a2a2a'
            self.canvas.create_rectangle(0, y, 1000, y + lane_height, 
                                        fill=lane_color, outline='')
            
            # Lane divider
            if i > 0:
                self.canvas.create_line(0, y, 1000, y, fill='#555555', width=2)
            
            # Start line
            self.canvas.create_line(self.start_line, y, self.start_line, y + lane_height, 
                                  fill='white', width=3)
            
            # Finish line (checkered pattern)
            for j in range(0, lane_height, 20):
                color = 'white' if (j // 20) % 2 == 0 else 'black'
                self.canvas.create_rectangle(self.finish_line, y + j, 
                                            self.finish_line + 10, y + j + 20,
                                            fill=color, outline='')
            
            # Car name label
            label_color = 'yellow' if car_data.get('is_player') else 'white'
            prefix = ">>> " if car_data.get('is_player') else ""
            self.canvas.create_text(15, y + lane_height // 2 - 10, 
                                  text=f"{prefix}{car_data['name']}", 
                                  anchor='w', fill=label_color, 
                                  font=('Courier', 12, 'bold' if car_data.get('is_player') else 'normal'))
            
            # Speed label
            speed_text = f"{car_data['velocity']:.1f} km/h"
            self.canvas.create_text(15, y + lane_height // 2 + 15, 
                                  text=speed_text, anchor='w', 
                                  fill='#aaaaaa', font=('Courier', 10))
        
        # Create car sprites
        self.car_sprites = []
        for i in range(self.num_cars):
            y = i * lane_height + lane_height // 2
            color = colors[i % len(colors)]
            
            # Simple car shape (rectangle with wheels)
            car_group = []
            
            # Car body - larger size
            body = self.canvas.create_rectangle(self.start_line, y - 20, 
                                               self.start_line + 50, y + 20,
                                               fill=color, outline='black', width=3)
            car_group.append(body)
            
            # Windows
            window = self.canvas.create_rectangle(self.start_line + 32, y - 14,
                                                 self.start_line + 47, y + 14,
                                                 fill='#ADD8E6', outline='black', width=2)
            car_group.append(window)
            
            # Wheels - larger
            wheel1 = self.canvas.create_oval(self.start_line + 5, y + 16,
                                            self.start_line + 18, y + 29,
                                            fill='black', outline='')
            wheel2 = self.canvas.create_oval(self.start_line + 32, y + 16,
                                            self.start_line + 45, y + 29,
                                            fill='black', outline='')
            wheel3 = self.canvas.create_oval(self.start_line + 5, y - 29,
                                            self.start_line + 18, y - 16,
                                            fill='black', outline='')
            wheel4 = self.canvas.create_oval(self.start_line + 32, y - 29,
                                            self.start_line + 45, y - 16,
                                            fill='black', outline='')
            car_group.extend([wheel1, wheel2, wheel3, wheel4])
            
            self.car_sprites.append(car_group)
        
        # Status label
        self.status_label = tk.Label(self.window, text="Get ready...", 
                                    font=('Helvetica', 16, 'bold'))
        self.status_label.pack(pady=10)
    
    def start_race(self):
        """Start the race animation"""
        self.status_label.config(text="🏁 Racing! 🏁")
        self.animate_race()
    
    def animate_race(self):
        """Animate one frame of the race"""
        if self.race_finished:
            return
        
        all_finished = True
        
        for i in range(self.num_cars):
            # Accelerate (simple acceleration model)
            max_v = self.car_max_velocities[i]
            accel = self.acceleration_rate[i]
            
            # Increase velocity until max
            if self.car_velocities[i] < max_v:
                self.car_velocities[i] += accel * self.time_scale * 100
                if self.car_velocities[i] > max_v:
                    self.car_velocities[i] = max_v
            
            # Update position based on current velocity
            # Scale velocity to pixels per frame
            velocity_px = (self.car_velocities[i] / max(self.car_max_velocities)) * 10
            self.car_positions[i] += velocity_px
            
            # Check if car hasn't finished
            if self.car_positions[i] < self.race_distance:
                all_finished = False
            
            # Move car sprite
            for sprite_id in self.car_sprites[i]:
                self.canvas.coords(sprite_id)
                current_coords = self.canvas.coords(sprite_id)
                dx = velocity_px
                
                if len(current_coords) == 4:  # Rectangle or oval
                    x1, y1, x2, y2 = current_coords
                    self.canvas.coords(sprite_id, x1 + dx, y1, x2 + dx, y2)
        
        # Check for winner
        if all_finished and self.winner_index is None:
            self.winner_index = 0  # First car in sorted list is the winner
            self.race_finished = True
            winner_name = self.race_data[self.winner_index]['name']
            self.status_label.config(text=f"🏆 WINNER: {winner_name}! 🏆", 
                                    foreground='gold')
            
            # Close window after 3 seconds
            self.window.after(3000, self.close)
            return
        
        # Continue animation
        self.animation_id = self.window.after(50, self.animate_race)
    
    def close(self):
        """Close the animation window"""
        if self.animation_id:
            self.window.after_cancel(self.animation_id)
        self.window.destroy()

class F1AIGame:
    def __init__(self, root):
        self.root = root
        self.root.title("F1-AI: Encrypted Racing Game")
        self.root.geometry("1400x850")
        self.root.resizable(True, True)
        
        # Game state
        self.xpf_balance = STARTING_XPF
        self.player_car_id = None
        self.player_car_name = "Player-F1"
        self.garage = []  # List of all player cars: [{"id": car_id, "name": str, "velocity": float, "generation": int}]
        self.selected_car_index = 0  # Index of currently selected car in garage
        self.ai_cars = []
        self.race_history = []
        self.training_count = 0
        
        # Setup UI
        self.setup_ui()
        
        # Initialize player car in background
        self.log_message("🏁 Welcome to F1-AI Encrypted Racing!")
        self.log_message("Initializing game (setting up cryptographic system)...")
        self.log_message("This may take a moment...")
        threading.Thread(target=self.initialize_game, daemon=True).start()
    
    def setup_ui(self):
        """Create the GUI layout"""
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="🏎️  F1-AI: Encrypted Racing", 
                               font=('Helvetica', 26, 'bold'))
        title_label.grid(row=0, column=0, columnspan=2, pady=15)
        
        # Left panel - Player info and controls
        left_frame = ttk.LabelFrame(main_frame, text="Player Dashboard", padding="10")
        left_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 5))
        
        # XPF Balance
        self.xpf_label = ttk.Label(left_frame, text=f"💰 XPF Balance: {self.xpf_balance}", 
                                   font=('Helvetica', 18, 'bold'))
        self.xpf_label.grid(row=0, column=0, columnspan=2, pady=12)
        
        # Garage Section
        ttk.Label(left_frame, text="🏠 Your Garage:", font=('Helvetica', 15, 'bold')).grid(
            row=1, column=0, columnspan=2, pady=(12, 8))
        
        # Garage listbox with scrollbar
        garage_frame = ttk.Frame(left_frame)
        garage_frame.grid(row=2, column=0, columnspan=2, pady=5, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        garage_scrollbar = ttk.Scrollbar(garage_frame, orient='vertical')
        self.garage_listbox = tk.Listbox(garage_frame, height=6, 
                                         yscrollcommand=garage_scrollbar.set,
                                         font=('Courier', 11))
        garage_scrollbar.configure(command=self.garage_listbox.yview)
        self.garage_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        garage_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.garage_listbox.bind('<<ListboxSelect>>', self.on_garage_select)
        
        # Selected car info
        ttk.Label(left_frame, text="Selected Car:", font=('Helvetica', 14, 'bold')).grid(
            row=3, column=0, columnspan=2, pady=(12, 8))
        
        self.car_info_label = ttk.Label(left_frame, text="Initializing...", 
                                        font=('Helvetica', 11), wraplength=320)
        self.car_info_label.grid(row=4, column=0, columnspan=2, pady=5)
        
        self.velocity_label = ttk.Label(left_frame, text="Speed: --- km/h", 
                                       font=('Helvetica', 16, 'bold'), foreground='blue')
        self.velocity_label.grid(row=5, column=0, columnspan=2, pady=8)
        
        # Training section
        ttk.Separator(left_frame, orient='horizontal').grid(
            row=6, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=12)
        
        ttk.Label(left_frame, text="Training Controls", 
                 font=('Helvetica', 14, 'bold')).grid(row=7, column=0, columnspan=2, pady=8)
        
        ttk.Label(left_frame, text="Select flags to train (0-9):", 
                 font=('Helvetica', 11)).grid(row=8, column=0, columnspan=2, pady=(8, 0))
        
        # Checkboxes for flag selection
        self.flag_vars = []
        checkbox_frame = ttk.Frame(left_frame)
        checkbox_frame.grid(row=9, column=0, columnspan=2, pady=8)
        
        checkbox_style = ttk.Style()
        checkbox_style.configure('Large.TCheckbutton', font=('Helvetica', 11))
        
        for i in range(N):
            var = tk.BooleanVar()
            self.flag_vars.append(var)
            cb = ttk.Checkbutton(checkbox_frame, text=f"t{i}", variable=var, 
                               style='Large.TCheckbutton')
            cb.grid(row=i // 5, column=i % 5, padx=8, pady=4)
        
        # Delta max slider
        ttk.Label(left_frame, text="Training intensity (delta_max):", 
                 font=('Helvetica', 11)).grid(row=10, column=0, columnspan=2, pady=(12, 0))
        
        self.delta_var = tk.IntVar(value=20)
        delta_slider = ttk.Scale(left_frame, from_=5, to=50, orient='horizontal',
                                variable=self.delta_var, length=250)
        delta_slider.grid(row=11, column=0, columnspan=2, pady=8)
        
        self.delta_label = ttk.Label(left_frame, text="20", font=('Helvetica', 12, 'bold'))
        self.delta_label.grid(row=12, column=0, columnspan=2)
        delta_slider.configure(command=lambda v: self.delta_label.configure(
            text=f"{int(float(v))}"))
        
        # Action buttons
        button_style = ttk.Style()
        button_style.configure('Large.TButton', font=('Helvetica', 12, 'bold'), padding=10)
        
        self.train_button = ttk.Button(left_frame, text=f"🔧 Train Selected Car (Cost: {TRAIN_COST} XPF)",
                                      command=self.train_car, state='disabled', style='Large.TButton')
        self.train_button.grid(row=13, column=0, columnspan=2, pady=12, sticky=(tk.W, tk.E))
        
        self.test_button = ttk.Button(left_frame, text="🧪 Test Speed",
                                     command=self.test_speed, state='disabled', style='Large.TButton')
        self.test_button.grid(row=14, column=0, columnspan=2, pady=8, sticky=(tk.W, tk.E))
        
        self.race_button = ttk.Button(left_frame, text=f"🏁 Race Selected Car (Cost: {RACE_COST} XPF)",
                                     command=self.enter_race, state='disabled', style='Large.TButton')
        self.race_button.grid(row=15, column=0, columnspan=2, pady=12, sticky=(tk.W, tk.E))
        
        # Stats
        ttk.Separator(left_frame, orient='horizontal').grid(
            row=16, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=12)
        
        self.stats_label = ttk.Label(left_frame, text="Garage: 0 | Races: 0 | Trainings: 0", 
                                     font=('Helvetica', 12))
        self.stats_label.grid(row=17, column=0, columnspan=2, pady=8)
        
        # Right panel - Log and race results
        right_frame = ttk.LabelFrame(main_frame, text="Game Log & Results", padding="10")
        right_frame.grid(row=1, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(5, 0))
        right_frame.rowconfigure(0, weight=1)
        right_frame.columnconfigure(0, weight=1)
        
        # Log area
        self.log_text = scrolledtext.ScrolledText(right_frame, width=55, height=28,
                                                  font=('Courier', 11), state='disabled')
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure tags for colored output
        self.log_text.tag_config('info', foreground='black', font=('Courier', 11))
        self.log_text.tag_config('success', foreground='green', font=('Courier', 11, 'bold'))
        self.log_text.tag_config('error', foreground='red', font=('Courier', 11, 'bold'))
        self.log_text.tag_config('warning', foreground='orange', font=('Courier', 11))
        self.log_text.tag_config('race', foreground='blue', font=('Courier', 11, 'bold'))
        
        # Bottom status bar
        status_frame = ttk.Frame(main_frame)
        status_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(12, 0))
        
        self.status_label = ttk.Label(status_frame, text="Status: Initializing...", 
                                      relief=tk.SUNKEN, anchor=tk.W, font=('Helvetica', 11))
        self.status_label.pack(fill=tk.X)
    
    def log_message(self, message, tag='info'):
        """Add message to log with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        self.log_text.configure(state='normal')
        self.log_text.insert(tk.END, f"[{timestamp}] {message}\n", tag)
        self.log_text.see(tk.END)
        self.log_text.configure(state='disabled')
    
    def update_status(self, status):
        """Update status bar"""
        self.status_label.configure(text=f"Status: {status}")
    
    def update_xpf_display(self):
        """Update XPF balance display"""
        color = 'green' if self.xpf_balance >= STARTING_XPF else 'red'
        self.xpf_label.configure(text=f"💰 XPF Balance: {self.xpf_balance}", foreground=color)
        self.stats_label.configure(
            text=f"Garage: {len(self.garage)} | Races: {len(self.race_history)} | Trainings: {self.training_count}")
    
    def update_garage_display(self):
        """Update the garage listbox with all cars"""
        self.garage_listbox.delete(0, tk.END)
        for i, car in enumerate(self.garage):
            # Format: "Gen X | 234.56 km/h | Name"
            display = f"Gen {car['generation']:2d} | {car['velocity']:7.2f} km/h | {car['name']}"
            self.garage_listbox.insert(tk.END, display)
            
            # Highlight the fastest car
            if i > 0 and car['velocity'] == max(c['velocity'] for c in self.garage):
                self.garage_listbox.itemconfig(i, foreground='green')
        
        # Select the current car
        if self.garage:
            self.garage_listbox.selection_set(self.selected_car_index)
            self.garage_listbox.see(self.selected_car_index)
    
    def on_garage_select(self, event):
        """Handle garage car selection"""
        selection = self.garage_listbox.curselection()
        if selection:
            self.selected_car_index = selection[0]
            car = self.garage[self.selected_car_index]
            self.player_car_id = car['id']
            
            # Update display
            self.car_info_label.configure(
                text=f"Gen {car['generation']} | ID: ...{car['id'][-8:]}")
            self.velocity_label.configure(text=f"Speed: {car['velocity']:.2f} km/h")
            
            self.log_message(f"🚗 Selected: {car['name']} (Gen {car['generation']}, {car['velocity']:.2f} km/h)")
    
    def initialize_game(self):
        """Initialize player car and AI opponents"""
        progress = None
        try:
            # Create progress dialog on main thread
            self.root.after(0, self._create_init_progress)
            time.sleep(0.1)  # Let dialog render
            
            # Create player car
            self.update_status("Creating your car...")
            if hasattr(self, 'progress_dialog'):
                self.root.after(0, lambda: self.progress_dialog.update_status("Creating your car..."))
            self.player_car_id = create_car(self.player_car_name)
            self.log_message(f"✅ Your car created: {self.player_car_id}", 'success')
            
            # Create AI opponents
            self.log_message(f"Creating {NUM_AI_OPPONENTS} AI opponents...")
            ai_names = ["Lightning-AI", "Thunder-AI", "Blaze-AI", "Storm-AI", "Rocket-AI"]
            for i, name in enumerate(ai_names, 1):
                self.update_status(f"Creating {name}...")
                if hasattr(self, 'progress_dialog'):
                    self.root.after(0, lambda n=name, idx=i: 
                                  self.progress_dialog.update_status(f"Creating AI car {idx}/{NUM_AI_OPPONENTS}: {n}..."))
                car_id = create_car(name)
                self.ai_cars.append({"id": car_id, "name": name})
                self.log_message(f"  ✓ {name} ready", 'info')
            
            # Get initial speed
            self.update_status("Testing initial speed...")
            if hasattr(self, 'progress_dialog'):
                self.root.after(0, lambda: self.progress_dialog.update_status("Testing your car's initial speed..."))
            _, velocity = get_car_velocity_kmh(self.player_car_id)
            
            # Close progress dialog and update UI on main thread
            self.root.after(0, self._close_progress)
            self.root.after(0, self._finish_initialization, velocity)
            
        except Exception as e:
            self.root.after(0, self._close_progress)
            self.root.after(0, lambda: self.log_message(f"❌ Initialization error: {e}", 'error'))
            self.root.after(0, lambda: messagebox.showerror("Error", f"Failed to initialize game: {e}"))
    
    def _create_init_progress(self):
        """Create initialization progress dialog"""
        self.progress_dialog = ProgressDialog(self.root, "Initializing Game", 
                                             "🔐 Setting up cryptographic system...")
    
    def _close_progress(self):
        """Close progress dialog if it exists"""
        if hasattr(self, 'progress_dialog'):
            self.progress_dialog.close()
            delattr(self, 'progress_dialog')
    
    def _finish_initialization(self, velocity):
        """Complete initialization on main thread"""
        # Add initial car to garage
        self.garage.append({
            "id": self.player_car_id,
            "name": f"{self.player_car_name} (Gen 0)",
            "velocity": velocity,
            "generation": 0
        })
        
        self.update_garage_display()
        self.car_info_label.configure(text=f"Gen 0 | ID: ...{self.player_car_id[-8:]}")
        self.velocity_label.configure(text=f"Speed: {velocity:.2f} km/h")
        
        # Enable buttons
        self.train_button.configure(state='normal')
        self.test_button.configure(state='normal')
        self.race_button.configure(state='normal')
        
        self.update_status("Ready to race!")
        self.update_xpf_display()
        self.log_message("🎮 Game ready! You can now train or race.", 'success')
        self.log_message(f"💡 Tip: Train your car to create new variants. Keep the fastest in your garage!")
    
    def train_car(self):
        """Train the player's car"""
        if self.xpf_balance < TRAIN_COST:
            messagebox.showwarning("Insufficient Funds", 
                                  f"Training costs {TRAIN_COST} XPF. Current balance: {self.xpf_balance}")
            return
        
        # Get selected indices
        selected_indices = [i for i, var in enumerate(self.flag_vars) if var.get()]
        
        if not selected_indices:
            messagebox.showwarning("No Flags Selected", 
                                  "Please select at least one flag (t0-t9) to train.")
            return
        
        # Disable buttons during training
        self.train_button.configure(state='disabled')
        self.race_button.configure(state='disabled')
        self.test_button.configure(state='disabled')
        
        delta_max = self.delta_var.get()
        self.log_message(f"🔧 Training car on flags {selected_indices} (delta_max={delta_max})...")
        self.update_status("Training in progress...")
        
        # Create progress dialog
        self.progress_dialog = ProgressDialog(self.root, "Training Car", 
                                             "🔧 Applying encrypted training modifications...")
        
        # Run training in background
        threading.Thread(target=self._do_training, 
                        args=(selected_indices, delta_max), daemon=True).start()
    
    def _do_training(self, indices, delta_max):
        """Execute training in background thread"""
        try:
            old_car_id = self.player_car_id
            old_car = self.garage[self.selected_car_index]
            
            # Update progress
            if hasattr(self, 'progress_dialog'):
                self.root.after(0, lambda: self.progress_dialog.update_status(
                    f"Training flags {indices} on encrypted data..."))
            
            # Train car
            new_car_id = train_car_random_subset(old_car_id, indices, delta_max=delta_max)
            
            # Update progress
            if hasattr(self, 'progress_dialog'):
                self.root.after(0, lambda: self.progress_dialog.update_status(
                    "Testing new car's speed..."))
            
            # Test new speed
            _, new_velocity = get_car_velocity_kmh(new_car_id)
            old_velocity = old_car['velocity']
            
            # Update game state
            self.xpf_balance -= TRAIN_COST
            self.training_count += 1
            
            # Calculate improvement
            improvement = new_velocity - old_velocity
            improvement_pct = (improvement / old_velocity * 100) if old_velocity > 0 else 0
            
            # Create new generation number
            new_generation = old_car['generation'] + 1
            
            # Close progress and update UI on main thread
            self.root.after(0, self._close_progress)
            self.root.after(0, self._finish_training, new_car_id, new_velocity, 
                          improvement, improvement_pct, new_generation)
            
        except Exception as e:
            self.root.after(0, self._close_progress)
            self.root.after(0, lambda: self.log_message(f"❌ Training error: {e}", 'error'))
            self.root.after(0, lambda: self.train_button.configure(state='normal'))
            self.root.after(0, lambda: self.race_button.configure(state='normal'))
            self.root.after(0, lambda: self.test_button.configure(state='normal'))
    
    def _finish_training(self, new_car_id, new_velocity, improvement, improvement_pct, new_generation):
        """Complete training on main thread"""
        # Add new car to garage
        new_car = {
            "id": new_car_id,
            "name": f"{self.player_car_name} (Gen {new_generation})",
            "velocity": new_velocity,
            "generation": new_generation
        }
        self.garage.append(new_car)
        
        # Select the newly created car
        self.selected_car_index = len(self.garage) - 1
        self.player_car_id = new_car_id
        
        # Update displays
        self.update_garage_display()
        self.car_info_label.configure(text=f"Gen {new_generation} | ID: ...{new_car_id[-8:]}")
        self.velocity_label.configure(text=f"Speed: {new_velocity:.2f} km/h")
        self.update_xpf_display()
        
        # Log result with appropriate color
        if improvement > 0:
            self.log_message(f"✅ New car created (Gen {new_generation})! Speed: {new_velocity:.2f} km/h "
                           f"(+{improvement:.2f}, +{improvement_pct:.1f}%)", 'success')
        elif improvement < 0:
            self.log_message(f"⚠️ New car created (Gen {new_generation}). Speed: {new_velocity:.2f} km/h "
                           f"({improvement:.2f}, {improvement_pct:.1f}%) - slower than parent!", 'warning')
        else:
            self.log_message(f"New car created (Gen {new_generation}). Speed unchanged: {new_velocity:.2f} km/h", 'info')
        
        self.log_message(f"💡 Your garage now has {len(self.garage)} car(s). Select the fastest for racing!")
        
        # Re-enable buttons
        self.train_button.configure(state='normal')
        self.race_button.configure(state='normal')
        self.test_button.configure(state='normal')
        self.update_status("Ready to race!")
    
    def test_speed(self):
        """Test current car speed"""
        self.test_button.configure(state='disabled')
        self.log_message("🧪 Testing car speed...")
        self.update_status("Testing speed...")
        
        # Create progress dialog
        car = self.garage[self.selected_car_index]
        self.progress_dialog = ProgressDialog(self.root, "Testing Speed", 
                                             f"🧪 Computing encrypted speed for {car['name']}...")
        
        threading.Thread(target=self._do_test_speed, daemon=True).start()
    
    def _do_test_speed(self):
        """Execute speed test in background"""
        try:
            if hasattr(self, 'progress_dialog'):
                self.root.after(0, lambda: self.progress_dialog.update_status(
                    "Computing speed on encrypted data..."))
            
            _, velocity = get_car_velocity_kmh(self.player_car_id)
            
            self.root.after(0, self._close_progress)
            self.root.after(0, self._finish_test_speed, velocity)
        except Exception as e:
            self.root.after(0, self._close_progress)
            self.root.after(0, lambda: self.log_message(f"❌ Speed test error: {e}", 'error'))
            self.root.after(0, lambda: self.test_button.configure(state='normal'))
    
    def _finish_test_speed(self, velocity):
        """Complete speed test on main thread"""
        # Update the garage entry for this car
        self.garage[self.selected_car_index]['velocity'] = velocity
        self.update_garage_display()
        
        self.velocity_label.configure(text=f"Speed: {velocity:.2f} km/h")
        car = self.garage[self.selected_car_index]
        self.log_message(f"📊 {car['name']} speed: {velocity:.2f} km/h", 'info')
        self.test_button.configure(state='normal')
        self.update_status("Ready to race!")
    
    def enter_race(self):
        """Enter a race against AI opponents"""
        if self.xpf_balance < RACE_COST:
            messagebox.showwarning("Insufficient Funds", 
                                  f"Racing costs {RACE_COST} XPF. Current balance: {self.xpf_balance}")
            return
        
        # Disable buttons during race
        self.train_button.configure(state='disabled')
        self.race_button.configure(state='disabled')
        self.test_button.configure(state='disabled')
        
        self.log_message("=" * 60, 'race')
        self.log_message("🏁 RACE STARTING!", 'race')
        self.log_message("=" * 60, 'race')
        self.update_status("Race in progress...")
        
        # Create progress dialog
        car = self.garage[self.selected_car_index]
        self.progress_dialog = ProgressDialog(self.root, "Racing", 
                                             f"🏁 Racing {car['name']} vs 5 AI opponents...")
        
        # Run race in background
        threading.Thread(target=self._do_race, daemon=True).start()
    
    def _do_race(self):
        """Execute race in background thread"""
        try:
            # Collect all car IDs
            all_car_ids = [self.player_car_id] + [car["id"] for car in self.ai_cars]
            
            # Update progress
            if hasattr(self, 'progress_dialog'):
                self.root.after(0, lambda: self.progress_dialog.update_status(
                    "Evaluating all cars (encrypted computation)..."))
            
            # Run race
            result = race_winner(all_car_ids)
            
            # Update progress
            if hasattr(self, 'progress_dialog'):
                self.root.after(0, lambda: self.progress_dialog.update_status(
                    "Determining winner..."))
            
            # Process results
            winner = result["winner"]
            leaderboard = result["leaderboard"]
            
            # Update game state
            self.xpf_balance -= RACE_COST
            player_won = winner["car_id"] == self.player_car_id
            
            if player_won:
                self.xpf_balance += RACE_REWARD
            
            self.race_history.append({
                "winner": winner["car_id"],
                "player_won": player_won,
                "leaderboard": leaderboard
            })
            
            # Prepare animation data
            player_car = self.garage[self.selected_car_index]
            animation_data = []
            for car in leaderboard:
                animation_data.append({
                    'name': car['name'],
                    'velocity': car['velocity_kmh'],
                    'car_id': car['car_id'],
                    'is_player': car['car_id'] == self.player_car_id
                })
            
            # Close progress and show animation on main thread
            self.root.after(0, self._close_progress)
            self.root.after(0, self._show_race_animation, animation_data, winner, leaderboard, player_won)
            
        except Exception as e:
            self.root.after(0, self._close_progress)
            self.root.after(0, lambda: self.log_message(f"❌ Race error: {e}", 'error'))
            self.root.after(0, lambda: self.train_button.configure(state='normal'))
            self.root.after(0, lambda: self.race_button.configure(state='normal'))
            self.root.after(0, lambda: self.test_button.configure(state='normal'))
    
    def _show_race_animation(self, animation_data, winner, leaderboard, player_won):
        """Show the race animation window"""
        try:
            # Show animation
            RaceAnimationWindow(self.root, animation_data)
            
            # Schedule results display after animation
            self.root.after(100, self._finish_race, winner, leaderboard, player_won)
        except Exception as e:
            self.log_message(f"⚠️ Animation error: {e}, showing results...", 'warning')
            self._finish_race(winner, leaderboard, player_won)
    
    def _finish_race(self, winner, leaderboard, player_won):
        """Complete race on main thread"""
        # Find player's car name from garage
        player_car = self.garage[self.selected_car_index]
        
        # Display results
        self.log_message("\n📊 RACE RESULTS:", 'race')
        self.log_message(f"Your car: {player_car['name']}", 'race')
        self.log_message("-" * 60, 'race')
        
        for i, car in enumerate(leaderboard, 1):
            position_emoji = ["🥇", "🥈", "🥉"] if i <= 3 else ["  "]
            emoji = position_emoji[0] if i <= 3 else "  "
            
            is_player = car["car_id"] == self.player_car_id
            prefix = ">>> " if is_player else "    "
            tag = 'success' if is_player else 'info'
            
            self.log_message(f"{prefix}{emoji} #{i}: {car['name']:<25} - "
                           f"{car['velocity_kmh']:>7.2f} km/h", tag)
        
        self.log_message("-" * 60, 'race')
        
        if player_won:
            self.log_message(f"🎉 CONGRATULATIONS! {player_car['name']} WON! (+{RACE_REWARD} XPF)", 'success')
        else:
            self.log_message(f"😔 {player_car['name']} didn't win. Try a different car or train more!", 'warning')
            self.log_message(f"Winner: {winner['name']} ({winner['velocity_kmh']:.2f} km/h)", 'info')
        
        self.log_message("=" * 60, 'race')
        self.log_message("")
        
        # Update balance display
        self.update_xpf_display()
        
        # Check if player is out of funds
        if self.xpf_balance < min(TRAIN_COST, RACE_COST):
            self.log_message("💸 You're out of funds! Game Over.", 'error')
            self.update_status("Game Over - Out of funds")
            messagebox.showinfo("Game Over", 
                              "You've run out of XPF! Thanks for playing!\n\n"
                              f"Final stats:\n"
                              f"Races: {len(self.race_history)}\n"
                              f"Trainings: {self.training_count}\n"
                              f"Wins: {sum(1 for r in self.race_history if r['player_won'])}")
        else:
            # Re-enable buttons
            self.train_button.configure(state='normal')
            self.race_button.configure(state='normal')
            self.test_button.configure(state='normal')
            self.update_status("Ready to race!")


def main():
    """Main entry point"""
    root = tk.Tk()
    app = F1AIGame(root)
    root.mainloop()


if __name__ == "__main__":
    main()
