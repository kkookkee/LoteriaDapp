// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract loteria is ERC20, Ownable {
    
    //Gestion de tokens

    //Direccion del contrato NFT del proyecto
    address public nft;
    //constructor
    constructor() ERC20("Loteria","GRL") {
        _mint(address(this),1000);
        nft = address(new mainERC721());
    }

    address public ganador;

    //registro de usuario
    mapping(address=>address) public usuario_contract;

    function precioTokens(uint256 _numTokens) internal pure returns (uint256){
        return _numTokens * (1 ether);
    }

    function balance_tokens(address _direccion) public view returns(uint256){
        return balanceOf(_direccion);
    }

    function balance_contract() public view returns(uint256){
        return balanceOf(address(this));
    }

    function verEthersSM() public view returns(uint256){
        return address(this).balance / 10**18;
    }

    function mintERC20(uint256 _cantidad) public onlyOwner{
        _mint(address(this), _cantidad);
    }

    //registro de usuarios 
    function registrar() internal {
        address addr_personal = address(new boletosNFT(msg.sender,address(this),nft));
        usuario_contract[msg.sender] = addr_personal;
    }

    //informacion de un usuario
    function usersInfo(address _account) public view returns(address){
        return usuario_contract[_account];
    }

    //comprar tokens ERC20
    function compraTokens(uint256 _numTokens) public payable{
        //registro de usuario
        if(usuario_contract[msg.sender]==address(0)){
            registrar();
        }
        //establecer el coste de los tokens a comprar
        uint256 coste = precioTokens(_numTokens);
        require(msg.value >= coste, "Compra mas ethers");
        //numero de tokens disponibles
        uint256 balanceSM = balance_contract();
        require(balanceSM >= _numTokens, "No hay tantos tokens disponibles, compra menos");
        //devolucion dinero sobrante
        uint256 returnValue = msg.value - coste;
        //pago
        payable(msg.sender).transfer(returnValue);
        //envio de tokens erc20
        _transfer(address(this),msg.sender,_numTokens);
    }

    function devolverTokens(uint256 _numTokens) public payable{
        //Numero de tokens mayor que 0
        require(_numTokens>0,"El numero a devolver tiene que ser mayor que 0");
        //el usuario tiene que tener los tokens a devolver
        require(_numTokens <= balance_tokens(msg.sender),"No tienes tantos tokens");
        //transferir tokens al SM
        _transfer(msg.sender,address(this),_numTokens);
        //SM envia ethers
        payable(msg.sender).transfer(precioTokens(_numTokens));
    }

    //gestion de loteria

    //precio boleto ERC20
    uint public precioBoleto = 5;
    //relacion persona-boleto
    mapping(address => uint[]) idPersona_boletos;
    //relacion boleto -> ganador
    mapping(uint => address) adnBoleto;
    //Numero aleatorio
    uint rand = 0;
    //Boletos de la loteria generados
    uint [] boletosLoteria;

    function compraBoletos(uint256 _numBoletos) public {
        //precio total de los boletos
        uint precioTotal = _numBoletos*precioBoleto;
        //comprobar si el usuario tiene tokens suficientes
        require(precioTotal <= balance_tokens(msg.sender),"No tienes suficientes tokens");
        //transfer de tokens usuario -> SM
        _transfer(msg.sender,address(this),precioTotal);
        for(uint i=0;i<_numBoletos;i++){
            uint random = uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,rand)))%10000;
            rand++;
            boletosLoteria.push(random);
            idPersona_boletos[msg.sender].push(random);
            adnBoleto[random] = msg.sender;
            boletosNFT(usuario_contract[msg.sender]).mintBoleto(msg.sender,random);
        }
    }

    function tusBoletos(address _propietario) public view returns(uint [] memory){
        return idPersona_boletos[_propietario];
    }

    function generarGanador() public onlyOwner returns(address){
        //longitud array
        uint256 longitud = boletosLoteria.length;
        //Verificacion compra 1 boleto
        require(longitud > 0,"No hay boletos comprados");
        //eleccion random entre 0 y la longitud
        uint random = uint(keccak256(abi.encodePacked(block.timestamp)))%longitud;
        //seleccion num random
        uint eleccion = boletosLoteria[random];
        //eleccion ganador 
        ganador = adnBoleto[eleccion];
        //envio 95% del bote
        payable(ganador).transfer(address(this).balance*95/100);
        //envio del 5% al owner
        payable(msg.sender).transfer(address(this).balance*5/100);
        return ganador;
    }
}

contract mainERC721 is ERC721 {
    address public direccionLoteria;
    constructor() ERC721("Loteria","TCK"){
        direccionLoteria = msg.sender;
    }

    //creacion de nft
    function safeMint(address _propietario, uint256 _boleto) public {
        require(msg.sender == loteria(direccionLoteria).usersInfo(_propietario),"No tienes permisos");
        _safeMint(_propietario, _boleto);
    }


}

contract boletosNFT {
    //datos del propietario
    struct Owner {
        address direccionPropietario;
        address contratoPadre;
        address contratoNFT;
        address contratoUsuario;
    }

    Owner public propietario;

    //constructor sm hijo
    constructor(address _propietario,address _contratoPadre,address _contratoNFT){
        propietario = Owner(_propietario,_contratoPadre,_contratoNFT, address(this));
    }

    //conversion boletos loteria
    function mintBoleto(address _propietario, uint _boleto) public {
        mainERC721(propietario.contratoNFT).safeMint(_propietario,_boleto);
    }
}