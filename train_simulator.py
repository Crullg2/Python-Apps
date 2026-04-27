"""Visual Train Simulator game (Tkinter).

Features:
- Build tracks by clicking on a grid map.
- Run the train along connected tracks from Start station to End station.
- Enter a simple cab view to control throttle/brake while train is moving.
- Earn score and money by delivering passengers.

Run:
    python train_simulator.py
"""

from __future__ import annotations

import random
import tkinter as tk
from collections import deque
from dataclasses import dataclass


@dataclass
class GameStats:
    score: int = 0
    money: int = 100
    trips_completed: int = 0
    passengers_delivered: int = 0


class TrainSimulatorApp(tk.Tk):
    CELL_SIZE = 50
    GRID_COLS = 14
    GRID_ROWS = 9

    def __init__(self) -> None:
        super().__init__()
        self.title("Train Simulator - Build & Drive")
        self.resizable(False, False)

        self.stats = GameStats()
        self.start = (self.GRID_ROWS // 2, 1)
        self.end = (self.GRID_ROWS // 2, self.GRID_COLS - 2)
        self.tracks: set[tuple[int, int]] = {self.start, self.end}
        self.path: list[tuple[int, int]] = []

        self.train_index = 0
        self.segment_progress = 0.0
        self.speed = 0.0
        self.max_speed = 140.0
        self.running = False
        self.in_cab_view = False
        self.passengers_waiting = random.randint(25, 80)

        self.scenery = self._generate_scenery()

        self._build_ui()
        self._draw_map()
        self._game_loop()

    def _build_ui(self) -> None:
        container = tk.Frame(self, padx=10, pady=10)
        container.pack()

        self.left_panel = tk.Frame(container)
        self.left_panel.grid(row=0, column=0, sticky="n")

        self.right_panel = tk.Frame(container)
        self.right_panel.grid(row=0, column=1, padx=(12, 0), sticky="n")

        map_w = self.GRID_COLS * self.CELL_SIZE
        map_h = self.GRID_ROWS * self.CELL_SIZE
        self.map_canvas = tk.Canvas(
            self.left_panel,
            width=map_w,
            height=map_h,
            bg="#d7ecff",
            highlightthickness=1,
            highlightbackground="#555",
        )
        self.map_canvas.pack()
        self.map_canvas.bind("<Button-1>", self._on_map_click)

        self.cab_canvas = tk.Canvas(
            self.left_panel,
            width=map_w,
            height=map_h,
            bg="#1c1f2c",
            highlightthickness=1,
            highlightbackground="#555",
        )

        title = tk.Label(self.right_panel, text="🚂 Train Simulator", font=("Arial", 16, "bold"))
        title.pack(anchor="w")

        self.status_lbl = tk.Label(self.right_panel, justify="left", font=("Consolas", 10))
        self.status_lbl.pack(anchor="w", pady=(8, 12))

        tk.Label(self.right_panel, text="Throttle", font=("Arial", 10, "bold")).pack(anchor="w")
        self.throttle = tk.Scale(
            self.right_panel,
            from_=0,
            to=100,
            orient="horizontal",
            length=240,
            command=lambda _v: self._update_speed_target(),
        )
        self.throttle.pack(anchor="w")

        control_row = tk.Frame(self.right_panel)
        control_row.pack(anchor="w", pady=(8, 8))

        tk.Button(control_row, text="Brake", width=10, command=self._brake).grid(row=0, column=0, padx=(0, 8))
        tk.Button(control_row, text="Horn", width=10, command=self._horn).grid(row=0, column=1)

        build_row = tk.Frame(self.right_panel)
        build_row.pack(anchor="w", pady=(4, 0))
        tk.Button(build_row, text="Clear Tracks", width=12, command=self._clear_tracks).grid(
            row=0, column=0, padx=(0, 8)
        )
        tk.Button(build_row, text="Auto Build", width=12, command=self._auto_build_track).grid(row=0, column=1)

        run_row = tk.Frame(self.right_panel)
        run_row.pack(anchor="w", pady=(8, 0))
        tk.Button(run_row, text="Run Train", width=12, command=self._start_run).grid(row=0, column=0, padx=(0, 8))
        tk.Button(run_row, text="Stop Train", width=12, command=self._stop_train).grid(row=0, column=1)

        tk.Button(
            self.right_panel,
            text="Toggle Cab View",
            width=26,
            command=self._toggle_view,
        ).pack(anchor="w", pady=(12, 0))

        tips = (
            "Tips:\n"
            "• Click on the map to place/remove tracks.\n"
            "• Connect Start (green) to End (red).\n"
            "• Run the train, then use throttle/brake in cab view."
        )
        tk.Label(self.right_panel, text=tips, justify="left", fg="#444").pack(anchor="w", pady=(12, 0))

    def _generate_scenery(self) -> list[tuple[int, int, str]]:
        scenery: list[tuple[int, int, str]] = []
        for _ in range(40):
            r = random.randint(0, self.GRID_ROWS - 1)
            c = random.randint(0, self.GRID_COLS - 1)
            if (r, c) in {self.start, self.end}:
                continue
            scenery.append((r, c, random.choice(["tree", "house", "pond"])))
        return scenery

    def _on_map_click(self, event: tk.Event) -> None:
        if self.running:
            return
        col = event.x // self.CELL_SIZE
        row = event.y // self.CELL_SIZE
        if not (0 <= row < self.GRID_ROWS and 0 <= col < self.GRID_COLS):
            return
        cell = (row, col)
        if cell in {self.start, self.end}:
            return
        if cell in self.tracks:
            self.tracks.remove(cell)
        else:
            self.tracks.add(cell)
        self._draw_map()

    def _clear_tracks(self) -> None:
        if self.running:
            return
        self.tracks = {self.start, self.end}
        self.path = []
        self._draw_map()

    def _auto_build_track(self) -> None:
        if self.running:
            return
        self.tracks = {self.start, self.end}
        r, c = self.start
        target_r, target_c = self.end

        while c < target_c:
            c += 1
            self.tracks.add((r, c))

        while r < target_r:
            r += 1
            self.tracks.add((r, c))
        while r > target_r:
            r -= 1
            self.tracks.add((r, c))

        # add a few branching sidings for visual richness
        mid = (self.GRID_ROWS // 2, self.GRID_COLS // 2)
        for dr in (-1, 1):
            branch = (mid[0] + dr, mid[1])
            if 0 <= branch[0] < self.GRID_ROWS:
                self.tracks.add(branch)

        self._draw_map()

    def _neighbors(self, cell: tuple[int, int]) -> list[tuple[int, int]]:
        r, c = cell
        candidates = [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]
        return [n for n in candidates if n in self.tracks]

    def _find_path(self) -> list[tuple[int, int]]:
        queue = deque([self.start])
        prev: dict[tuple[int, int], tuple[int, int] | None] = {self.start: None}

        while queue:
            current = queue.popleft()
            if current == self.end:
                break
            for nxt in self._neighbors(current):
                if nxt not in prev:
                    prev[nxt] = current
                    queue.append(nxt)

        if self.end not in prev:
            return []

        path = []
        cursor: tuple[int, int] | None = self.end
        while cursor is not None:
            path.append(cursor)
            cursor = prev[cursor]
        path.reverse()
        return path

    def _start_run(self) -> None:
        self.path = self._find_path()
        if len(self.path) < 2:
            self.status_lbl.config(text="Build a connected track from Start to End first.")
            return

        self.running = True
        self.train_index = 0
        self.segment_progress = 0.0
        self.speed = 0.0
        self.throttle.set(40)
        self._update_speed_target()
        self._draw_map()

    def _stop_train(self) -> None:
        self.running = False
        self.speed = 0.0
        self.throttle.set(0)
        self._draw_map()

    def _toggle_view(self) -> None:
        self.in_cab_view = not self.in_cab_view
        if self.in_cab_view:
            self.map_canvas.pack_forget()
            self.cab_canvas.pack()
            self._draw_cab()
        else:
            self.cab_canvas.pack_forget()
            self.map_canvas.pack()
            self._draw_map()

    def _update_speed_target(self) -> None:
        target = (self.throttle.get() / 100.0) * self.max_speed
        if self.running:
            self.speed += (target - self.speed) * 0.15

    def _brake(self) -> None:
        self.speed *= 0.55
        self.throttle.set(max(0, self.throttle.get() - 25))

    def _horn(self) -> None:
        self.status_lbl.config(text="HONK! Passengers cheer as you pass by.")

    def _draw_grid(self) -> None:
        w = self.GRID_COLS * self.CELL_SIZE
        h = self.GRID_ROWS * self.CELL_SIZE
        for x in range(0, w + 1, self.CELL_SIZE):
            self.map_canvas.create_line(x, 0, x, h, fill="#aac6d8")
        for y in range(0, h + 1, self.CELL_SIZE):
            self.map_canvas.create_line(0, y, w, y, fill="#aac6d8")

    def _draw_map(self) -> None:
        self.map_canvas.delete("all")
        self._draw_grid()

        # scenery
        for r, c, kind in self.scenery:
            x1 = c * self.CELL_SIZE
            y1 = r * self.CELL_SIZE
            x2 = x1 + self.CELL_SIZE
            y2 = y1 + self.CELL_SIZE
            if kind == "tree":
                self.map_canvas.create_oval(x1 + 18, y1 + 10, x1 + 33, y1 + 25, fill="#2f8f2f", outline="")
                self.map_canvas.create_rectangle(x1 + 23, y1 + 23, x1 + 28, y1 + 33, fill="#7a4f2a", outline="")
            elif kind == "house":
                self.map_canvas.create_rectangle(x1 + 14, y1 + 16, x1 + 34, y1 + 34, fill="#e8d6a8", outline="")
                self.map_canvas.create_polygon(x1 + 12, y1 + 16, x1 + 24, y1 + 8, x1 + 36, y1 + 16, fill="#b15045")
            else:
                self.map_canvas.create_oval(x1 + 12, y1 + 14, x1 + 36, y1 + 30, fill="#5caee0", outline="")

        # tracks
        for r, c in self.tracks:
            x1 = c * self.CELL_SIZE
            y1 = r * self.CELL_SIZE
            x2 = x1 + self.CELL_SIZE
            y2 = y1 + self.CELL_SIZE
            self.map_canvas.create_rectangle(x1 + 5, y1 + 5, x2 - 5, y2 - 5, fill="#676767", outline="#3d3d3d")
            self.map_canvas.create_line(x1 + 8, y1 + 15, x2 - 8, y1 + 15, fill="#cfcfcf", width=2)
            self.map_canvas.create_line(x1 + 8, y2 - 15, x2 - 8, y2 - 15, fill="#cfcfcf", width=2)

        self._draw_station(self.start, "Start", "#37b24d")
        self._draw_station(self.end, "End", "#e03131")

        if self.running and len(self.path) >= 2:
            x, y = self._train_pixel_position()
            self.map_canvas.create_rectangle(x - 14, y - 10, x + 14, y + 10, fill="#1d4ed8", outline="#0b2f80")
            self.map_canvas.create_rectangle(x - 4, y - 16, x + 10, y - 10, fill="#60a5fa", outline="")

    def _draw_station(self, cell: tuple[int, int], name: str, color: str) -> None:
        r, c = cell
        x1 = c * self.CELL_SIZE
        y1 = r * self.CELL_SIZE
        x2 = x1 + self.CELL_SIZE
        y2 = y1 + self.CELL_SIZE
        self.map_canvas.create_rectangle(x1 + 3, y1 + 3, x2 - 3, y2 - 3, outline=color, width=3)
        self.map_canvas.create_text((x1 + x2) // 2, y2 - 8, text=name, fill=color, font=("Arial", 8, "bold"))

    def _train_pixel_position(self) -> tuple[float, float]:
        cell_a = self.path[self.train_index]
        cell_b = self.path[min(self.train_index + 1, len(self.path) - 1)]

        ax = cell_a[1] * self.CELL_SIZE + self.CELL_SIZE / 2
        ay = cell_a[0] * self.CELL_SIZE + self.CELL_SIZE / 2
        bx = cell_b[1] * self.CELL_SIZE + self.CELL_SIZE / 2
        by = cell_b[0] * self.CELL_SIZE + self.CELL_SIZE / 2

        x = ax + (bx - ax) * self.segment_progress
        y = ay + (by - ay) * self.segment_progress
        return x, y

    def _advance_train(self) -> None:
        if not self.running or len(self.path) < 2:
            return

        # movement speed in cells/frame
        movement = (self.speed / self.max_speed) * 0.08
        self.segment_progress += movement

        while self.segment_progress >= 1.0 and self.train_index < len(self.path) - 2:
            self.segment_progress -= 1.0
            self.train_index += 1

        if self.train_index >= len(self.path) - 2 and self.segment_progress >= 1.0:
            self._finish_trip()

    def _finish_trip(self) -> None:
        self.running = False
        self.speed = 0.0
        self.throttle.set(0)

        delivered = min(self.passengers_waiting, random.randint(20, 60))
        earned = delivered * 3

        self.stats.passengers_delivered += delivered
        self.stats.money += earned
        self.stats.score += delivered + 40
        self.stats.trips_completed += 1

        self.passengers_waiting = random.randint(20, 90)
        self.status_lbl.config(
            text=(
                f"Trip complete! Delivered {delivered} passengers.\n"
                f"Earned ${earned}. Build a new route or run again!"
            )
        )

    def _draw_cab(self) -> None:
        self.cab_canvas.delete("all")
        w = self.GRID_COLS * self.CELL_SIZE
        h = self.GRID_ROWS * self.CELL_SIZE

        # windshield and track perspective
        self.cab_canvas.create_rectangle(40, 40, w - 40, h - 60, fill="#2b2f3f", outline="#8aa0ff", width=2)
        self.cab_canvas.create_polygon(w / 2 - 120, h - 60, w / 2 - 25, 85, w / 2 - 8, 85, w / 2 - 70, h - 60, fill="#9aa3b2")
        self.cab_canvas.create_polygon(w / 2 + 120, h - 60, w / 2 + 25, 85, w / 2 + 8, 85, w / 2 + 70, h - 60, fill="#9aa3b2")

        signal_color = "#22c55e" if self.running else "#f59e0b"
        self.cab_canvas.create_oval(w - 130, 70, w - 95, 105, fill=signal_color, outline="")
        self.cab_canvas.create_text(w - 112, 120, text="SIGNAL", fill="#d0d7ff", font=("Arial", 9, "bold"))

        # dashboard
        self.cab_canvas.create_rectangle(0, h - 95, w, h, fill="#101522", outline="")
        self.cab_canvas.create_text(90, h - 52, text=f"Speed: {int(self.speed)} km/h", fill="#f8fafc", font=("Consolas", 12, "bold"))
        self.cab_canvas.create_text(285, h - 52, text=f"Throttle: {self.throttle.get()}%", fill="#f8fafc", font=("Consolas", 12, "bold"))
        self.cab_canvas.create_text(500, h - 52, text=f"Passengers waiting: {self.passengers_waiting}", fill="#f8fafc", font=("Consolas", 11))

        if not self.running:
            self.cab_canvas.create_text(
                w / 2,
                30,
                text="Cab View: Start a run to drive the train",
                fill="#d1d5db",
                font=("Arial", 11, "italic"),
            )

    def _update_status(self) -> None:
        current_mode = "Cab" if self.in_cab_view else "Map"
        run_state = "Running" if self.running else "Idle"
        status = (
            f"Mode: {current_mode} | Train: {run_state}\n"
            f"Trips: {self.stats.trips_completed} | Score: {self.stats.score}\n"
            f"Money: ${self.stats.money} | Delivered: {self.stats.passengers_delivered}\n"
            f"Passengers waiting: {self.passengers_waiting}"
        )

        if "Trip complete!" not in self.status_lbl.cget("text") and "HONK!" not in self.status_lbl.cget("text"):
            self.status_lbl.config(text=status)

    def _game_loop(self) -> None:
        self._update_speed_target()
        self._advance_train()
        self._update_status()

        if self.in_cab_view:
            self._draw_cab()
        else:
            self._draw_map()

        self.after(40, self._game_loop)


if __name__ == "__main__":
    app = TrainSimulatorApp()
    app.mainloop()
