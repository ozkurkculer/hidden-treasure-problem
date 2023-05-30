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
const populationData = [];
// const populationFitnessScores = [];
// const populationFitnessManhattan = [];
// const iterationSize = 50
const crossingOverRatio = 0.7;
const mutationRatio = 0.01;
const iterationSize = 5;

// Oyun alanı matris olarak oluşturulur
const createMap = (areaSize, trophyCoordinates, trophySize) => {
  const arr = new Array(areaSize)
    .fill(" ")
    .map(() => new Array(areaSize).fill(" "));

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

const createInitPop = (arr, populationSize, populationData) => {
  for (let i = 0; i < populationSize; i++) {
    const randomX = Math.floor(Math.random() * areaSize - 1) + 1;
    const randomY = Math.floor(Math.random() * areaSize - 1) + 1;
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

const calculateFitnessScore = (
  populationData,
  trophyCoordinates,
  populationSize,
  trophySize
) => {
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

const calculateOneMemberFitnessScore = (member, trophyCoordinates) => {
  // X ve Y mesafelerinin mutlak değer farkları alınır
  let dx = Math.abs(trophyCoordinates[0].x - member.x);
  let dy = Math.abs(trophyCoordinates[0].y - member.y);

  // X ve Y mesafelerinin mutlak değer toplamı alınır, bu alınan toplam populationFitnessManhattan dizisine eklenir
  let distanceMan = dx + dy;
  return distanceMan;
};

function crossingOver(crossingOverRatio, populationData) {
  /*
    [TR] gerekli hesaplamalar için değişkenler tanımlanır ve kaç adet 
    çaprazlama yapılacağı, çaprazlamanın başlayacağı bitin hangisi 
    olacağı belirlenir.
  */

  let arrSum = 0;
  let arrRouletteRatio = [];
  let tempRatio = [];
  let newRatio = 0;

  /*
    [TR] Üyelerin sayılarının büyüklüklerine göre yüzdelik oranlarının
    belirlendiği coding işlemi yapılır. Burada üyelerin hangi aralıklarda
    yer alacağı belirlenir. Örneğin 1 - 2 - 3 - 4 - 5 sayıları yaklaşık
    %6.66 - %13.32 - %19,98 - %26,64 - %33,3 yüzdelik oranlarına sahip olur.
  */

  for (let i = 0; i < populationData.length; i++) {
    arrSum += populationData[i].manhattanDistance;
  }

  for (let i = 0; i < populationData.length; i++) {
    tempRatio.push(
      Math.floor((populationData[i].manhattanDistance * 100) / arrSum)
    );
  }

  for (let i = 0; i < tempRatio.length; i++) {
    newRatio += arrSum - populationData[i].manhattanDistance;
    tempRatio[i] = arrSum - populationData[i].manhattanDistance;
  }

  for (let i = 0; i < tempRatio.length; i++) {
    arrRouletteRatio.push(Math.floor((tempRatio[i] * 100) / newRatio));
  }

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

  let memberSize = Math.floor(populationData.length * crossingOverRatio) * 2;

  for (let i = 0; i < memberSize; i++) {
    let a = Math.floor(Math.random() * 99 + 1);
    let index = transformedArray.findIndex((element) => element > a);
    if (index < 0) {
      index++;
    }
    randomMembers.push(index);
  }
  console.log("Rastgele seçilen üye indexleri:", randomMembers);
  /*
    [TR] Çaprazlama için seçilmiş üyeler karşılıklı olarak seçilir.
    ve çaprazlama işlemi gerçekleşir. Örneğin 0,1,2,3 numaralı
    üyeler için 0-3 ve 1-2 çarpazlaması yapılır.
  */
  populationData.sort((a, b) => b.manhattanDistance - a.manhattanDistance);

  let largestMembers = populationData.slice(0, memberSize / 2);

  const randomDirection = Math.floor(Math.random() * 2) + 1;
  if (randomDirection == 1) {
    for (let i = 0; i < randomMembers.length / 2; i++) {
      let temp = populationData[randomMembers[i]].x;
      let temp2 = populationData[randomMembers[randomMembers.length - i - 1]].x;

      let tempAvg = Math.ceil((temp + temp2) / 2);

      largestMembers[i].x = tempAvg;
    }
  } else {
    for (let i = 0; i < randomMembers.length / 2; i++) {
      let temp = populationData[randomMembers[i]].y;
      let temp2 = populationData[randomMembers[randomMembers.length - i - 1]].y;

      let tempAvg = Math.ceil((temp + temp2) / 2);
      largestMembers[i].y = tempAvg;
    }
  }
}

function mutation(mutationRatio, populationData, areaSize) {
  let mutationSize = Math.ceil(mutationRatio * populationData.length);
  for (let i = 0; i < mutationSize; i++) {
    let randomIndex = Math.floor(Math.random() * populationData.length);
    if (randomIndex < 0) {
      randomIndex++;
    }
    const randomElement = populationData[randomIndex];
    const randomCoordinate = Math.floor(Math.random() * areaSize - 1);
    const randomDirection = Math.floor(Math.random() * 2) + 1;
    if (randomDirection == 1) {
      randomElement.x = randomCoordinate;
    } else {
      randomElement.y = randomCoordinate;
    }
    if (
      calculateOneMemberFitnessScore(randomElement, trophyCoordinates) <
        randomElement.manhattanDistance &&
      randomDirection == 1
    ) {
      console.log("\nMUTASYON SONUCU", randomIndex ,". ÜYE GÜNCELLENDİ\n");
      populationData[randomIndex].x = randomCoordinate;
    } else if (
      calculateOneMemberFitnessScore(randomElement, trophyCoordinates) <
      randomElement.manhattanDistance
    ) {
      console.log("\nMUTASYON SONUCU", randomIndex ,". ÜYE GÜNCELLENDİ\n");
      populationData[randomIndex].y = randomCoordinate;
    }
  }
}

function changeTreasueLocation() {}

function updateMap(arr, trophyCoordinates, populationData) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = " ";
    }
  }

  for (let i = 0; i < populationData.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      for (let k = 0; k < arr[i].length; k++) {
        if (j == populationData[i].x && k == populationData[i].y) {
          arr[j][k] = "x";
        }
      }
    }
  }
  arr[trophyCoordinates[0].x][trophyCoordinates[0].y] = "*";
  return arr;
}

let area = createMap(areaSize, trophyCoordinates, trophySize);

area = createInitPop(area, populationSize, populationData);
calculateFitnessScore(
  populationData,
  trophyCoordinates,
  populationSize,
  trophySize
);

// console.log("Hazine Koordinatları:", trophyCoordinates);
// console.log("Popülasyon Verileri:", populationData);

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

for (let i = 0; i < iterationSize; i++) {
  
  crossingOver(crossingOverRatio, populationData);

  calculateFitnessScore(
    populationData,
    trophyCoordinates,
    populationSize,
    trophySize
  );

  mutation(mutationRatio, populationData, areaSize);

  calculateFitnessScore(
    populationData,
    trophyCoordinates,
    populationSize,
    trophySize
  );

  // console.log(populationData);

  updateMap(area, trophyCoordinates, populationData);
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
}
