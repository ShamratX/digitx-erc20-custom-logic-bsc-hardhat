// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract DigitX is ERC20, Ownable {

    uint8 private constant _decimals = 18;
    uint256 public constant lpReserve          = 200_000_000 * (10 ** _decimals); // 20%
    uint256 public constant exchangeReserve    = 150_000_000 * (10 ** _decimals); // 15%
    uint256 public constant treasuryReserve    = 150_000_000 * (10 ** _decimals); // 15%
    uint256 public constant marketingReserve   = 150_000_000 * (10 ** _decimals); // 15%
    uint256 public constant teamReserve        = 200_000_000 * (10 ** _decimals); // 20%
    uint256 public constant developmentReserve = 150_000_000 * (10 ** _decimals); // 15%

    bool public firstBuyCompleted = false;
    address public pancakeSwapPool; // Just changes pancakeSwapPool to uniswapPool for ETH (Uniswap)
    event FirstBuyDone();

    uint public constant MODE_NORMAL = 0;
    uint public constant MODE_TRANSFER_RESTRICTED = 1;
    uint public constant MODE_TRANSFER_CONTROLLED = 2;
    uint public _mode;

    bool private _initialized;

    constructor(
        address _lpReserve,
        address _exchangeReserve,
        address _treasuryReserve,
        address _marketingReserve,
        address _teamReserve,
        address _developmentReserve
        
    ) ERC20("DigitX", "DigitX") Ownable(msg.sender) {
        require(
            _lpReserve != address(0) &&
            _exchangeReserve != address(0) &&
            _treasuryReserve != address(0) &&
            _marketingReserve != address(0) &&
            _teamReserve != address(0) &&
            _developmentReserve != address(0), "Zero Address"
        );
 
        _mint(_lpReserve, lpReserve);
        _mint(_exchangeReserve, exchangeReserve);
        _mint(_treasuryReserve, treasuryReserve);
        _mint(_marketingReserve, marketingReserve);
        _mint(_teamReserve, teamReserve);
        _mint(_developmentReserve, developmentReserve);
    }

    function setPancakeSwapPool(address _pancakeSwapPool) external onlyOwner {
        require(_pancakeSwapPool != address(0), "Pool address cannot be zero");
        pancakeSwapPool = _pancakeSwapPool;
    }

    function init() public onlyOwner {
        require(!_initialized, "Token: already initialized");
        _initialized = true;
        _mode = MODE_TRANSFER_RESTRICTED;
    }

    function _update(address from, address to, uint256 value) internal virtual override {
        // Just changes pancakeSwapPool to uniswapPool for ETH (Uniswap)
        // No one can buy until owner set pool address to the contract and until owner first buy from the pool.
        if (!firstBuyCompleted && from != address(0)) {
            if (from == pancakeSwapPool && pancakeSwapPool != address(0)) {
                require(to == owner(), "First Buy Pending");
                firstBuyCompleted = true;
                emit FirstBuyDone();
            } else {
                if (to != owner() && to != pancakeSwapPool) {
                    revert("First phase: only owner can receive");
                }
            }
        }
        // Transfer restricted mode
        if (_mode == MODE_TRANSFER_RESTRICTED) {
            revert("Token: Transfer is restricted");
        }
        if (_mode == MODE_TRANSFER_CONTROLLED) {
            require(from == owner() || to == owner(), "Token: Invalid transfer");
        }

        super._update(from, to, value);
    }

    function setMode(uint256 v) public onlyOwner {
        if (_mode != MODE_NORMAL) {
            _mode = v;
        }
    }

}