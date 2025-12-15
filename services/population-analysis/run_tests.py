#!/usr/bin/env python3
"""
Test runner for Population Analysis service.

Usage:
    python run_tests.py              # Run all tests
    python run_tests.py --unit       # Run only unit tests
    python run_tests.py --coverage   # Run with coverage report
    python run_tests.py --verbose    # Run with verbose output
"""

import subprocess
import sys
import argparse


def run_tests(args):
    """Run tests with specified options."""
    cmd = ["python", "-m", "pytest"]
    
    if args.unit:
        cmd.extend(["-m", "unit"])
    
    if args.coverage:
        cmd.extend(["--cov=main", "--cov-report=term-missing", "--cov-report=html"])
    
    if args.verbose:
        cmd.append("-v")
    
    if args.fast:
        cmd.extend(["-x", "--tb=short"])
    
    if args.file:
        cmd.append(args.file)
    else:
        cmd.append("test_main.py")
    
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    return result.returncode


def main():
    parser = argparse.ArgumentParser(description="Run Population Analysis tests")
    parser.add_argument("--unit", action="store_true", help="Run only unit tests")
    parser.add_argument("--coverage", action="store_true", help="Generate coverage report")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--fast", "-x", action="store_true", help="Stop on first failure")
    parser.add_argument("--file", "-f", help="Run specific test file")
    
    args = parser.parse_args()
    
    return run_tests(args)


if __name__ == "__main__":
    sys.exit(main())