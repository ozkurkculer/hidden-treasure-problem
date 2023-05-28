// Oyun alanının belirlenmesi
const areaSize = 10;

// Hazine sayısı ve koordinatları, popülasyon sayısı ve koordinatları, popülasyon elemanlarının skorlarının olduğu dizi değişken olarak tanımlandı
const trophySize = 1;
const trophyCoordinates = [];
const populationSize = 3;
const populationData = [];
const populationFitnessScores = [];
const populationFitnessManhattan = [];
// const iterationSize = 50
const crossingOverRatio = 0.7;
const mutationRatio = 0.01

// Oyun alanı matris olarak oluşturulur
const gameArea = (areaSize, trophySize, trophyCoordinates) => {
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

const createInıtPop = (arr, populationSize, populationData) => {
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

const calculateOneMemberFitnessScore = (populationData,
  trophyCoordinates, index) => {
  // X ve Y mesafelerinin mutlak değer farkları alınır
  let dx = Math.abs(trophyCoordinates[0].x - populationData[index].x);
  let dy = Math.abs(trophyCoordinates[0].y - populationData[index].y);

  // X ve Y mesafelerinin mutlak değer toplamı alınır, bu alınan toplam populationFitnessManhattan dizisine eklenir
  let distanceMan = dx + dy;
  return distanceMan;
}

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
    arrRouletteRatio.push(
      Math.floor((tempRatio[i] * 100) / newRatio)
    );
    
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

  console.log("Oranlar:",arrRouletteRatio,"\nRulet oranı:", transformedArray);
  let randomMembers = [];

  /*
    [TR] Oluşturulan rulet oranlarına göre rastgele sayılar seçilerek
    hangi üyelerin seçileceği kararlaştırılır ve randomMembers arrayine
    eklenir.
  */


  let memberSize = Math.floor(populationData.length * crossingOverRatio) * 2;

  for (let i = 0; i < memberSize; i++) {
    let a = Math.floor((Math.random() * 99) + 1);
    const index = transformedArray.findIndex(element => element > a);
    randomMembers.push(index);
  }
  console.log(randomMembers);


  /*
      [TR] Çaprazlama için seçilmiş üyeler karşılıklı olarak seçilir.
      ve çaprazlama işlemi gerçekleşir. Örneğin 0,1,2,3 numaralı
      üyeler için 0-3 ve 1-2 çarpazlaması yapılır.
  */
  for (let i = 0; i < randomMembers.length / 2; i++) {
      let temp = populationData[randomMembers[i]].x
      let temp2 =populationData[randomMembers[randomMembers.length - i - 1]].x

      let tempAvg = (temp + temp2) / 2;
      populationData[randomMembers[i]].x = populationData[randomMembers[randomMembers.length - i - 1]].x = tempAvg;
  }

}

function mutation(mutationRatio, populationData, areaSize) {
  let mutationSize = Math.ceil(mutationRatio * populationData.length);
  for (let i = 0; i < mutationSize; i++) {
    const randomIndex = Math.floor(Math.random() * populationData.length);
    const randomElement = populationData[randomIndex];
    const randomCoordinate = Math.floor(Math.random() * areaSize-1)
    const randomDirection = Math.floor(Math.random() * 2) + 1
    if (randomDirection == 1) {
      randomElement.x = randomCoordinate;
      
    } else {
      
    }
  }
}

let area = gameArea(areaSize, trophySize, trophyCoordinates);
area = createInıtPop(area, populationSize, populationData);
calculateFitnessScore(
  populationData,
  trophyCoordinates,
  populationSize,
  trophySize
);

console.log("Hazine Koordinatları:", trophyCoordinates);
console.log("Popülasyon Verileri:", populationData);

console.table(area);

const minObject = populationData.reduce((min, current) => {
  return current.manhattanDistance < min.manhattanDistance ? current : min;
});

const minIndex = populationData.findIndex(obj => obj.x === minObject.x);


console.log(
  "En yakın mesafe:",
  minObject.manhattanDistance,
  "En yakın mesafenin olduğu eleman:",
  minIndex + 1
);

crossingOver(crossingOverRatio, populationData);

calculateFitnessScore(
  populationData,
  trophyCoordinates,
  populationSize,
  trophySize
);

console.log(populationData);

mutation(mutationRatio,populationData,areaSize);