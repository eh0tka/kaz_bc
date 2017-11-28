pragma solidity ^0.4.18;

/// @title Простое голосование
contract Voting {
    // Структура, описывающая поля голосующего
    struct Voter {
        bool voted;  // если true - значит уже проголосовал
        uint vote;   // номер кандидата, за которого проголосовал
    }

    // Структура, описывающая кандидата на выборах
    struct Candidate {
        bytes32 name;   // Имя кандидата
        uint voteCount; // Количество собранных голосов
    }

    // Список, содержащий адреса проголосовавших и за кого проголосовали
    mapping(address => Voter) private voters;

    // Публичный список кандидатов
    Candidate[] private candidates;
    
    event ShowVoting(string, bool);

    /// Конструктор для создания списка кандидатов
    function Voting(bytes32[] candidateNames) public {

        // Для списка переданных имен мы создаем список кандидатов
        // и присваиваем им количество голосов
        for (uint i = 0; i < candidateNames.length; i++) {
            candidates.push(Candidate({
                name: candidateNames[i],
                voteCount: 0
            }));
        }
    }

    /// Голосование голосующего 
    function vote(uint candidateNumber) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted);
        
        ShowVoting("Voting succeed", true);
        sender.voted = true;
        sender.vote = candidateNumber;

        // Дописываем голос кандидату
        candidates[candidateNumber].voteCount += 1;
    }

    /// @dev Находит номер кандидата c наибольшим числом голосов
    function winnerCandidateNum() private constant returns (uint _candidateNum)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < candidates.length; p++) {
            if (candidates[p].voteCount > winningVoteCount) {
                winningVoteCount = candidates[p].voteCount;
                _candidateNum = p;
            }
        }
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName() public constant returns (bytes32 _winnerName)
    {
        _winnerName = candidates[winnerCandidateNum()].name;
    }

    //Вернуть количество кандидатов
    function getCandidateCount() public constant returns(uint) {
        return candidates.length;
    }

    //Вернуть данные по кандидату
    function getCandidate(uint index) public constant returns(bytes32, uint) {
        return (candidates[index].name, candidates[index].voteCount);
    }
    
    //За кого я голосовал?
    function whomIVoted() public constant returns(uint _candidateNum) {
        if (voters[msg.sender].voted) {
            _candidateNum = voters[msg.sender].vote;
        } else {
            _candidateNum = 999;
        }
    }
    
    //Получить мои данные голосования
    function getVotingData() public constant returns(bool, uint) {
        return (voters[msg.sender].voted, voters[msg.sender].vote);
    }
}