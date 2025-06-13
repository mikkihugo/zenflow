"""Setup configuration for Complex Hello World application."""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="complex-hello-world",
    version="1.0.0",
    author="Hello World Team",
    author_email="hello@example.com",
    description="A sophisticated multi-module Python Hello World application",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/example/complex-hello-world",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        # Core dependencies (none required for basic functionality)
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "black>=22.0.0",
            "flake8>=5.0.0",
            "mypy>=0.990",
            "isort>=5.10.0",
        ],
        "color": [
            "colorama>=0.4.6",
        ],
        "env": [
            "python-dotenv>=0.19.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "hello-complex=main:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)