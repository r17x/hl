{
  description = "Micromeet Project development";

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-linux"
        "x86_64-darwin"
      ];

      perSystem =
        { pkgs, ... }:
        {
          devShells = {
            default = pkgs.mkShell {
              buildInputs = [
                pkgs.bun
                pkgs.nodejs
                pkgs.python311Packages.fastapi
                pkgs.python311Packages.uvicorn
              ];
            };
          };
        };
    };

  inputs = {
    # utilities for Flake
    flake-parts.url = "github:hercules-ci/flake-parts";

    ## -- nixpkgs
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nixpkgs.follows = "nixpkgs-unstable";
  };
}
