class L2Regularizer {
    constructor(config) {
      this.l2 = config.l2;
    }

    apply(weights) {
      return tf.tidy(() => tf.mul(this.l2, tf.sum(tf.square(weights))));
    }

    static get className() {
      return 'L2'; 
    }
  }
  tf.serialization.registerClass(L2Regularizer);

  let model;
  let vocabulary = [];

  // Fungsi untuk memuat model
  async function loadModel() {
    try {
      const modelPath = './model.json';
      model = await tf.loadLayersModel(modelPath);
      console.log('Model berhasil dimuat.');
    } catch (error) {
      console.error('Gagal memuat model:', error);
      document.getElementById('errorLog').textContent = 'Error: Gagal memuat model. Periksa file model.json.';
    }
  }

  // Fungsi untuk memuat vocabulary dari vocab.txt
  async function loadVocabulary() {
    try {
      const response = await fetch('vocab.txt');
      const text = await response.text();
      vocabulary = text.split('\n').map(word => word.trim()); // Jangan hilangkan elemen kosong

      // Tambahkan elemen kosong jika diperlukan
      if (vocabulary[0] !== '') {
        vocabulary.unshift('');
      }

      // Hilangkan duplikasi
      vocabulary = [...new Set(vocabulary)];

      console.log('Final Vocabulary:', vocabulary);
      console.log('Length:', vocabulary.length);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      throw new Error('Failed to load vocabulary');
    }
  }



  // Fungsi untuk memproses teks input
  function vectorizeText(inputText, vocabulary, maxLength) {
    if (vocabulary.length === 0) {
      throw new Error('Vocabulary kosong. Pastikan vocab berhasil dimuat.');
    }

    if (!inputText.trim()) {
      throw new Error('Input teks kosong atau tidak valid.');
    }

    const tokens = inputText
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Hapus karakter non-alfanumerik
      .split(/\s+/); // Tokenisasi berdasarkan spasi
    console.log('Tokens:', tokens); // Debugging tokenisasi

    const vector = tokens.map(token => {
      const index = vocabulary.indexOf(token);
      return index !== -1 ? index : vocabulary.indexOf('[UNK]'); // Gunakan indeks [UNK] jika token tidak ditemukan
    });

    const paddingLength = Math.max(0, maxLength - vector.length);
    const paddedVector = vector.concat(Array(paddingLength).fill(0));
    const finalVector = paddedVector.slice(0, maxLength);

    console.log('Vectorized Tokens:', finalVector); // Debugging hasil akhir
    return finalVector;
  }

  // Fungsi untuk menjalankan prediksi
  async function runModel() {
    if (!model || vocabulary.length === 0) {
      document.getElementById('output').textContent = 'Model atau vocabulary belum dimuat!';
      return;
    }

    try {
      const inputText = document.getElementById('inputText').value;

      if (!inputText.trim()) {
        document.getElementById('output').textContent = 'Masukkan teks yang valid!';
        return;
      }

      const maxLength = 20;
      const inputArray = vectorizeText(inputText, vocabulary, maxLength);

      console.log('Input Array:', inputArray); // Debugging

      const tensorInput = tf.tensor2d([inputArray], [1, maxLength]); // Bentuk input: [1, 20]
      console.log('Tensor Input Shape:', tensorInput.shape);

      const prediction = model.predict(tensorInput);
      const result = await prediction.data(); // Ambil hasil sebagai array
      console.log('Raw Prediction:', result); // Debugging hasil prediksi

      const threshold = 0.5;
      const label = result[0] >= threshold ? "Legal" : "Illegal";
      document.getElementById('output').textContent = `Hasil: ${label} (Confidence: ${result[0].toFixed(2)})`;

      document.getElementById('errorLog').textContent = ''; // Reset error log
    } catch (error) {
      console.error('Gagal melakukan prediksi:', error);
      document.getElementById('errorLog').textContent = 'Error: Gagal melakukan prediksi. Periksa input atau model.';
    }
  }

  // Fungsi untuk mereset input dan output
  function resetInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('output').textContent = '';
    document.getElementById('errorLog').textContent = '';
  }

  // Muat model dan vocabulary saat halaman dimuat
  window.onload = async () => {
    await loadModel();
    await loadVocabulary();
  };