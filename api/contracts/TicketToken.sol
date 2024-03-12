// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

//OrganizerContract
contract TicketToken is ERC721 {
    address public immutable owner;

    event TicketMinted(
        string indexed eventId,
        address indexed user,
        string indexed ticketType,
        uint256 tokenCount
    );

    struct EntityStruct {
        uint256 cost;
        uint256 maxNumberOfTickets;
        uint256 totalTokenSupply;
        string eventId;
        bool isEntity;
    }
    mapping(string => EntityStruct) public TicketTypeCosts;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "ownership is required");
        _;
    }

    modifier checkCost(string memory _id, uint256 _tokenCount) {
        uint256 ticketCost = getTicketTypeCost(_id);
        uint256 tokenCost = _tokenCount * ticketCost;

        require(msg.value >= tokenCost, "Not enough funds");
        require(msg.value <= tokenCost, "Overpayment");
        _;
    }

    modifier checkAmount(string memory _id, uint256 _tokenCount) {
        if (TicketTypeCosts[_id].maxNumberOfTickets == 0) {
            require(_tokenCount >= 1, "amount must Greater than 1");
            _;
        } else {
            require(
                (_tokenCount <= TicketTypeCosts[_id].maxNumberOfTickets &&
                    _tokenCount >= 1) &&
                    TicketTypeCosts[_id].totalTokenSupply + _tokenCount <=
                    TicketTypeCosts[_id].maxNumberOfTickets,
                string.concat(
                    "amount must be between 1 and ",
                    Strings.toString(TicketTypeCosts[_id].maxNumberOfTickets)
                )
            );
            _;
        }
    }

    function mint(
        string memory _id,
        uint256 _tokenCount
    ) public payable checkAmount(_id, _tokenCount) checkCost(_id, _tokenCount) {
        TicketTypeCosts[_id].totalTokenSupply =
            TicketTypeCosts[_id].totalTokenSupply +
            _tokenCount;
        _safeMint(msg.sender, TicketTypeCosts[_id].totalTokenSupply);
        // emit TicketMinted(
        //     TicketTypeCosts[_id].eventId,
        //     msg.sender,
        //     _tokenCount
        // );
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner).call{value: address(this).balance}("");
        require(os);
    }

    function addTicketTypeCost(
        string memory _id,
        string memory eventId,
        uint256 _cost,
        uint256 maxNumberOfTickets
    ) public onlyOwner {
        TicketTypeCosts[_id].cost = _cost;
        TicketTypeCosts[_id].eventId = eventId;
        TicketTypeCosts[_id].maxNumberOfTickets = maxNumberOfTickets;
        TicketTypeCosts[_id].isEntity = true;
    }

    function updateTicketTypeCost(
        string memory _id,
        uint256 _cost,
        uint256 maxNumberOfTickets
    ) public onlyOwner {
        TicketTypeCosts[_id].cost = _cost;
        TicketTypeCosts[_id].maxNumberOfTickets = maxNumberOfTickets;
        TicketTypeCosts[_id].isEntity = true;
    }

    function getTicketTypeCost(
        string memory _id
    ) public view returns (uint256) {
        require(TicketTypeIsEntity(_id), "Ticket Type does not exist");
        return TicketTypeCosts[_id].cost;
    }

    function TicketTypeIsEntity(string memory _id) public view returns (bool) {
        return TicketTypeCosts[_id].isEntity;
    }

    function getTicketTypeTotalTokenSupply(
        string memory _id
    ) public view onlyOwner returns (uint256) {
        require(TicketTypeIsEntity(_id), "Ticket Type does not exist");
        return TicketTypeCosts[_id].totalTokenSupply;
    }
}
