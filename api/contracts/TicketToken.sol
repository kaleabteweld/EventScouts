// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

//OrganizerContract
contract TicketToken is ERC721 {
    address public immutable owner;

    struct EntityStruct {
        uint256 cost;
        bool isEntity;
    }
    mapping(string => EntityStruct) public EventCosts;

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

    function mint(string memory _eventId, uint256 _tokenCount) public payable {
        uint256 eventCost = getEventCost(_eventId);
        require(msg.value != eventCost, "check your funds");

        require(_tokenCount <= 5 && _tokenCount >= 1, "amount must be 1 to 5");

        // _safeMint(msg.sender, totalSupply);
    }

    function addEventCost(string memory _id, uint256 _cost) public onlyOwner {
        EventCosts[_id].cost = _cost;
        EventCosts[_id].isEntity = true;
    }

    function getEventCost(string memory _id) public view returns (uint256) {
        require(EventIsEntity(_id), "eventId does not exist");
        return EventCosts[_id].cost;
    }

    function EventIsEntity(string memory _id) public view returns (bool) {
        return EventCosts[_id].isEntity;
    }
}
