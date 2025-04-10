// Импортируем нужные функции из TON SDK
import { TonClient, WalletContractV4, beginCell, toNano } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

// Настраиваем подключение к TON testnet
const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: 'ab104caa1371c1c715d3a7f1cb94125a5cfb613bf71e2bd69fdf581b65f8b51b' // Замени на свой ключ (см. ниже как получить)
});

// Переменная для хранения кошелька
let wallet = null;
let keyPair = null;

// Функция подключения кошелька
async function connectWallet() {
    try {
        // Для простоты используем мнемоническую фразу (в реальном dApp лучше использовать TonConnect)
        const mnemonic = "bone force file toast claw lazy little improve action first butter humor surge dose sure athlete scrap wise novel paper endorse initial outdoor target"; // Замени на свои 24 слова от кошелька
        keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
        wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletAddress = wallet.address.toString();
        console.log("Connected wallet:", walletAddress);
        document.getElementById('connectWalletBtn').textContent = `Connected: ${walletAddress.slice(0, 6)}...`;
    } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet. Check console for details.");
    }
}

// Функция публикации игры (пример)
async function publishGame() {
    if (!wallet) {
        alert("Please connect a wallet first!");
        return;
    }

    const contract = client.open(wallet);
    const seqno = await contract.getSeqno();

    try {
        await contract.sendTransfer({
            seqno: seqno,
            secretKey: keyPair.secretKey,
            messages: [{
                to: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", // Адрес контракта платформы (пока заглушка)
                value: toNano("0.1"), // 0.1 TON для публикации
                body: beginCell().storeStringTail("Publish: FTL:TON Edition").endCell()
            }]
        });
        alert("Game published to TON testnet!");
    } catch (error) {
        console.error("Error publishing game:", error);
        alert("Failed to publish game. Check console.");
    }
}

// Привязка событий к кнопкам
document.getElementById('connectWalletBtn').addEventListener('click', () => {
    document.getElementById('walletModal').classList.remove('hidden');
    connectWallet(); // Автоматически подключаем для простоты
});

document.getElementById('closeWalletModal').addEventListener('click', () => {
    document.getElementById('walletModal').classList.add('hidden');
});

document.getElementById('publishBtn').addEventListener('click', publishGame);

document.getElementById('testBtn').addEventListener('click', () => {
    const testingSection = document.getElementById('testingSection');
    testingSection.classList.remove('hidden');
    testingSection.scrollIntoView({ behavior: 'smooth' });
});

// Обработка загрузки файлов (оставляем как есть)
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadedFiles = document.getElementById('uploadedFiles');
const testBtn = document.getElementById('testBtn');
const publishBtn = document.getElementById('publishBtn');

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFiles);
dropZone.addEventListener('drop', handleDrop);
['dragenter', 'dragover'].forEach(event => dropZone.addEventListener(event, () => dropZone.classList.add('border-green-500')));
['dragleave', 'drop'].forEach(event => dropZone.addEventListener(event, () => dropZone.classList.remove('border-green-500')));

function handleFiles(e) {
    const files = e.target.files;
    if (files.length > 0) {
        fileList.classList.remove('hidden');
        uploadedFiles.innerHTML = '';
        for (let file of files) {
            const li = document.createElement('li');
            li.textContent = `${file.name} (${formatFileSize(file.size)})`;
            uploadedFiles.appendChild(li);
        }
        testBtn.disabled = false;
        publishBtn.disabled = false;
    }
}

function handleDrop(e) {
    e.preventDefault();
    handleFiles({ target: { files: e.dataTransfer.files } });
}

function formatFileSize(bytes) {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}