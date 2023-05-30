// const express = require('express');
// const app = express();

// app.use(express.static(__dirname + '/public'));

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

// app.listen(8080, () => {
//   console.log('Server listening on http://localhost:8080');
// });

// Oyun alanının belirlenmesi
const areaSize = 10;

// Hazine sayısı ve koordinatları, popülasyon sayısı ve koordinatları, popülasyon elemanlarının skorlarının olduğu dizi değişken olarak tanımlandı
const trophySize = 1;
const trophyCoordinates = [];
const populationSize = 3;
let populationData = [];
const crossingOverRatio = 0.7;
const mutationRatio = 0.01;

// İterasyon sayısı belirlenir. Yani kaç defa crossing over ve mutasyon yapılacağı belirlenir.
const iterationSize = 10; 
let successRate = 0;

// Oyun alanı matris olarak oluşturulur
const createMap = (areaSize, trophyCoordinates, trophySize) => {
  const arr = new Array(areaSize).fill(" ").map(() => new Array(areaSize).fill(" "));

  // Rastgele hazine belirlenir
  for (let i = 0; i < trophySize; i++) {
    const randomX = Math.floor(Math.random() * areaSize - 1) + 1;
    const randomY = Math.floor(Math.random() * areaSize - 1) + 1;

    if (arr[randomX][randomY] != "*") {
      arr[randomX][randomY] = "*";
      // Ödüllerin koordinatları bir dizi içerisine eklenir
      trophyCoordinates.push({ x: randomX, y: randomY });
    } else {
      i -= 1;
      continue;
    }
  }

  return arr;
};

// İlk elemanların yani ebeveynlerin belirlenmesi
const createInitPop = (arr, populationSize, populationData) => {
  // Popülasyon sayısına göre rastgele x ve y koordinatlarıyla ebeveynler belirlenir.
  for (let i = 0; i < populationSize; i++) {
    // Rastgele sayılar belirlenirken Math.floor ile sayının tabanı alınır. Yani 2.5 -> 2 
    const randomX = Math.floor(Math.random() * areaSize - 1) + 1;
    const randomY = Math.floor(Math.random() * areaSize - 1) + 1;

    // Elemanların ilk belirlemede üst üste çakışmaması için kontrol yapılır.
    if (arr[randomX][randomY] != "*" || arr[randomX][randomY] != "x") {
      arr[randomX][randomY] = "x";
      // Popülasyon elemanları koordinat dizisine eklenir
      populationData.push({ x: randomX, y: randomY });
    } else {
      i -= 1;
      continue;
    }
  }
  return arr;
};

// Fitness Skorunun Belirlenmesi
const calculateFitnessScore = ( populationData, trophyCoordinates, populationSize, trophySize ) => {

  // Popülasyonun hazineye göre Manhattan ve Euclidian uzaklıkları hesaplanıp populationData objectine eklenir.
  for (let i = 0; i < populationSize; i++) {
    for (let j = 0; j < trophySize; j++) {
      // X ve Y mesafelerinin farkları alınır
      const distanceX = trophyCoordinates[j].x - populationData[i].x;
      const distanceY = trophyCoordinates[j].y - populationData[i].y;

      // X ve Y mesafelerinin karelerinin toplamının karekökü alınır ve populationFitnessScores dizisine eklenir
      const distance = Math.sqrt(
        Math.pow(distanceX, 2) + Math.pow(distanceY, 2)
      );
      populationData[i].euclidianDistance = distance;

      // X ve Y mesafelerinin mutlak değer farkları alınır
      let dx = Math.abs(trophyCoordinates[j].x - populationData[i].x);
      let dy = Math.abs(trophyCoordinates[j].y - populationData[i].y);

      // X ve Y mesafelerinin mutlak değer toplamı alınır, bu alınan toplam populationFitnessManhattan dizisine eklenir
      let distanceMan = dx + dy;
      populationData[i].manhattanDistance = distanceMan;
    }
  }
};

//Tek bir elemanın fitness skorunun belirlenmesi. Bu fonksiyon mutasyonda karşılaştırma için kullanılır.
const calculateOneMemberFitnessScore = (member, trophyCoordinates) => {
  // X ve Y mesafelerinin mutlak değer farkları alınır
  let dx = Math.abs(trophyCoordinates[0].x - member.x);
  let dy = Math.abs(trophyCoordinates[0].y - member.y);

  // X ve Y mesafelerinin mutlak değer toplamı alınır, bu alınan toplam populationFitnessManhattan dizisine eklenir
  let distanceMan = dx + dy;
  return distanceMan;
};


// Crossingover yani çaprazlama fonksiyonu.
function crossingOver(crossingOverRatio, populationData) {
  /*
    [TR] gerekli hesaplamalar için değişkenler tanımlanır ve kaç adet 
    çaprazlama yapılacağı, çaprazlamanın başlayacağı bitin hangisi 
    olacağı belirlenir.
  */

  let arrSum = 0; //Manhattan mesafelerinin toplamı
  let arrRouletteRatio = []; //Ruletteki oran dizisi
  let tempRatio = []; //Geçici oranların dizisi
  let newRatio = 0; //Manhattan mesafelerinin tersinin toplamı. Yani 1-2-3-4-5 sayılarının man. mes = 15, tersinin mesafesi = 56

  /*
    [TR] Üyelerin sayılarının büyüklüklerine göre yüzdelik oranlarının
    belirlendiği coding işlemi yapılır. Burada üyelerin hangi aralıklarda
    yer alacağı belirlenir. Örneğin 1 - 2 - 3 - 4 - 5 sayıları yaklaşık
    %33.3 - %26,64 - %19,98 - %13.32 - %6.66 yüzdelik oranlarına sahip olur.
  */

  for (let i = 0; i < populationData.length; i++) {
    arrSum += populationData[i].manhattanDistance;
  }

  // Manhattan mesafelerinin tersinin toplamı alınır ve farkları tempRatio dizisine eklenir.
  for (let i = 0; i < populationData.length; i++) {
    newRatio += arrSum - populationData[i].manhattanDistance;
    tempRatio.push(arrSum - populationData[i].manhattanDistance);
  }

  // Yüzdelik orana göre hesaplama yapılır.
  for (let i = 0; i < tempRatio.length; i++) {
    arrRouletteRatio.push(Math.floor((tempRatio[i] * 100) / newRatio));
  }

  // Oranlar toplanarak 0-100 arasına dönüştürülür
  let transformedArray = arrRouletteRatio.reduce(
    (accumulator, currentValue) => {
      if (accumulator.length === 0) {
        accumulator.push(currentValue);
      } else {
        const prevValue = accumulator[accumulator.length - 1];
        const transformedValue = prevValue + currentValue;
        accumulator.push(transformedValue);
      }
      return accumulator;
    },
    []
  );

  // console.log("Oranlar:", arrRouletteRatio, "\nRulet oranı:", transformedArray);


  let randomMembers = [];

  /*
    [TR] Oluşturulan rulet oranlarına göre rastgele sayılar seçilerek
    hangi üyelerin seçileceği kararlaştırılır ve randomMembers arrayine
    eklenir.
  */

  //crossingOver oranı ile eleman sayısını çarpıp çocuk sayısını hesaplanır. Ayrıca 2 ile çarpıp ebeveynlerinin sayısı hesaplanır.
  let memberSize = Math.floor(populationData.length * crossingOverRatio) * 2;

  //Rastgele ebeveynler belirlenir.
  for (let i = 0; i < memberSize; i++) {
    let a = Math.floor(Math.random() * 99 + 1);
    let index = transformedArray.findIndex((element) => element > a);

    // Eğer sayı bazı durumlarda maksimumun üzerinde çıkarsa indis -1 yerine 0 alınır
    if (index < 0) {
      index = 0;
    }

    randomMembers.push(index);
  }
  console.log("Rastgele seçilen üye indexleri:", randomMembers);
  
  /*
    [TR] Çaprazlama için seçilmiş üyeler karşılıklı olarak seçilir.
    ve çaprazlama işlemi gerçekleşir. Örneğin 0,1,2,3 numaralı
    üyeler için 0-3 ve 1-2 çarpazlaması yapılır.
  */

  //Populasyonda elitizmin oluşması için elemanlarların manhattan mesafesi büyükten küçüğe sıralanır.
  populationData.sort((a, b) => b.manhattanDistance - a.manhattanDistance);
  let tempData = populationData.map(obj => ({ ...obj }));

  //x veya y yönü için rastgele seçim yapılır. Eğer 1 ise x, 2 ise y yönü seçilir.
  let randomDirection = Math.floor(Math.random() * 2) + 1;

  //Seçilen ebeveynlerin x veya y koordinatları alınıp bu iki sayının aritmetik ortalaması çocuğa yazılır.
  if (randomDirection === 1) {
    for (let i = 0; i < Math.floor(randomMembers.length / 2); i++) {
      let temp = populationData[randomMembers[i]].x;
      let temp2 = populationData[randomMembers[randomMembers.length - i - 1]].x;
      
      let tempAvg = Math.ceil((temp + temp2) / 2);
      // console.log("X",temp, temp2, tempAvg);
      tempData[i].x = tempAvg;
    }
  } else if (randomDirection === 2) {
    for (let i = 0; i < Math.floor(randomMembers.length / 2); i++) {
      let temp = populationData[randomMembers[i]].y;
      let temp2 = populationData[randomMembers[randomMembers.length - i - 1]].y;

      let tempAvg = Math.ceil((temp + temp2) / 2);
      // console.log("Y",temp, temp2, tempAvg);
      tempData[i].y = tempAvg;
    }
  }
  populationData = JSON.parse(JSON.stringify(tempData))
  return populationData
}


// Mutasyon fonksiyonu
function mutation(mutationRatio, populationData, areaSize) {

  // Yapılacak mutasyon sayısı belirlenir. Bu hesaplama mutasyon oranının populasyon sayısı ile çarpımının yukarı yönlü yuvarlanmasıyla hesaplanır.
  let mutationSize = Math.ceil(mutationRatio * populationData.length );

  // Mutasyon sayısı for döngüsü ile dönürülür. 
  for (let i = 0; i < mutationSize; i++) {
    
    // Rastgele index belirlenir. Eğer sayı 0 dan küçük çıkarsa 1 eklenir.  
    let randomIndex = Math.floor(Math.random() * populationData.length);
    if (randomIndex < 0) {
      randomIndex = 0;
    }

    // rasgele eleman populasyon datasından randomElement değişkenine yazılır.
    let randomElement = JSON.parse(JSON.stringify(populationData[randomIndex]));

    // Rastgele bir koordinat belirlenir. Bu koordinat alan mesafesine göre yazılır. Örn. areaSize = 10 ise 0-10 arası bir sayı alınır.
    let randomCoordinate = Math.floor(Math.random() * areaSize - 1);

    // Rastgele x veya y doğrultusu belirlenir.
    let randomDirection = Math.floor(Math.random() * 2) + 1;
    

    if (randomDirection == 1) {
      randomElement.x = randomCoordinate;
    } else {
      randomElement.y = randomCoordinate;
    }

    /* 
      Mutasyonun verimli mi yoksa zararlı mı olduğu belirlenir. 
      calculateOneMemberFitnessScore fonksiyonundan dönen sonucu manhattan mesafesi
      ile karşılaştırır. Karşılaştırma sonucu eğer mutasyon daha düşük bir mesafe veriyor ise
      mutasyon gerçekleşir. Verimli sonuç çıkmaz ise mutasyon gerçekleşmez.
    */
    if (calculateOneMemberFitnessScore(randomElement, trophyCoordinates) <randomElement.manhattanDistance && randomDirection == 1) {
      console.log("\nMUTASYON SONUCU", randomIndex ,". ÜYE GÜNCELLENDİ\n");
      populationData[randomIndex].x = randomCoordinate;
    } else if (calculateOneMemberFitnessScore(randomElement, trophyCoordinates) < randomElement.manhattanDistance ) {
      console.log("\nMUTASYON SONUCU", randomIndex ,". ÜYE GÜNCELLENDİ\n");
      populationData[randomIndex].y = randomCoordinate;
    }
  }
  return populationData;
}

// Hazineyi hareket ettirme fonksiyonu
function changeTreasueLocation(trophyCoordinates, areaSize) {
  /* 
    Rastgele bir yön belirlenir. 
    Bu yöne göre eğer alan büyüklüğünü aşmaz ise sağa veya aşağı hareket eder.
    Aşar ise sola veya yukarı hareket eder.
  */
  let randomDirection = Math.floor(Math.random() * 2) + 1;
  if (randomDirection == 1 && trophyCoordinates[0].x + 1 < areaSize) {
    trophyCoordinates[0].x++;
  } else if (randomDirection == 2 && trophyCoordinates[0].y + 1 < areaSize) {
    trophyCoordinates[0].y++;
  } else if (randomDirection == 1) {
    trophyCoordinates[0].x--;
  } else if (randomDirection == 2) {
    trophyCoordinates[0].y--;
  }
}

// Haritayı güncelleme fonksiyonu
function updateMap(arr, trophyCoordinates, populationData) {

  // Harita temizlenir
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = " ";
    }
  }

  // Haritanın içerisine elemanlar yerleştirilir.
  for (let i = 0; i < populationData.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      for (let k = 0; k < arr[i].length; k++) {
        if (j == populationData[i].x && k == populationData[i].y) {
          arr[j][k] = "x";
        }
      }
    }
  }
  // Hazine yerleştilir. 
  arr[trophyCoordinates[0].x][trophyCoordinates[0].y] = "*";
  return arr;
}

function calculateSuccessRate(populationData, areaSize) {
  let sumManhattanDistance = 0;
  let maxDistance = (areaSize*2 - 2) * populationData.length ;
  let minDistance = 0;
  for (let i = 0; i < populationData.length; i++) {
    sumManhattanDistance +=  populationData[i].manhattanDistance;
  }
  console.log("Başarı oranı:", Math.ceil(((maxDistance - sumManhattanDistance) / (maxDistance - minDistance)) * 100));

}

/* --------------------------------------------------------------- 
   Hazine Avının Başlangıcı
   --------------------------------------------------------------- */

// Harita ve hazine oluşturulur.
let area = createMap(areaSize, trophyCoordinates, trophySize);


// İlk ebeveynler oluşturulur.
area = createInitPop(area, populationSize, populationData);

// Fitness skoru hesaplanır.
calculateFitnessScore(
  populationData,
  trophyCoordinates,
  populationSize,
  trophySize
);

// console.log("Hazine Koordinatları:", trophyCoordinates);
// console.log("Popülasyon Verileri:", populationData);

// popülasyon verileri yazdırılır
console.log(populationData);

// Tablo oluşturulur.
console.table(area);

// En yakın mesafe ve en yakın mesafenin olduğu eleman belirlenir.
let minObject = populationData.reduce((min, current) => {
  return current.manhattanDistance < min.manhattanDistance ? current : min;
});

let minIndex = populationData.findIndex((obj) => obj.x === minObject.x);

console.log(
  "En yakın mesafe:",
  minObject.manhattanDistance,
  "En yakın mesafenin olduğu eleman:",
  minIndex + 1
);


//İterasyon sayısına göre hazine hareket eder, çaprazlama ve mutasyon yapılıp fitness skorlar hesaplanır.
for (let i = 0; i < iterationSize; i++) {
  changeTreasueLocation(trophyCoordinates, areaSize);

  calculateFitnessScore(
    populationData,
    trophyCoordinates,
    populationSize,
    trophySize
  );
  
  populationData = crossingOver(crossingOverRatio, populationData);

  calculateFitnessScore(
    populationData,
    trophyCoordinates,
    populationSize,
    trophySize
  );

  populationData = mutation(mutationRatio, populationData, areaSize);

  calculateFitnessScore(
    populationData,
    trophyCoordinates,
    populationSize,
    trophySize
  );

  // Harita güncellenir
  updateMap(area, trophyCoordinates, populationData);

  // En yakın mesafe ve en yakın mesafenin olduğu eleman belirlenir.
  console.log(populationData);
  console.table(area);

  let minObject = populationData.reduce((min, current) => {
    return current.manhattanDistance < min.manhattanDistance ? current : min;
  });

  let minIndex = populationData.findIndex((obj) => obj.x === minObject.x);

  console.log(
    "En yakın mesafe:",
    minObject.manhattanDistance,
    "En yakın mesafenin olduğu eleman:",
    minIndex + 1
  );
  calculateSuccessRate(populationData, areaSize)
}
