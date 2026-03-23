"""Services package — lazy imports for all AI services.

Services are imported lazily in route handlers to avoid loading
heavy ML libraries at startup. Do not add eager imports here.
"""
