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
// const mutationRatio = 0.01
// const bitSize = 6

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

function crossingOver(crossingOverRatio, populationData, trophyCoordinates) {
  /*
        [TR] gerekli hesaplamalar için değişkenler tanımlanır ve kaç adet 
        çaprazlama yapılacağı, çaprazlamanın başlayacağı bitin hangisi 
        olacağı belirlenir.
    */

  let arrSum = 0;
  let arrRouletteRatio = [];
  let tempRatio = [];
  let newRatio = 0;

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
  
  console.log(tempRatio);
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

  console.log(arrRouletteRatio, transformedArray);
  let randomMembers = [];

  let memberSize = Math.floor(populationData.length * crossingOverRatio);
  console.log(memberSize);
  for (let i = 0; i < memberSize; i++) {
      Math.floor((Math.random() * 100) + 1);

  }
  // let arrRouletteRatioSum = 0

  // let crossingOverNumber = Math.round(arr.length * crossingOverRatio)

  // if (crossingOverNumber % 2 == 1) {
  //     crossingOverNumber += 1
  // }

  // arr.forEach((element) => {
  //     arrSum += parseInt(element, 2)
  // })

  // let rouletteRatio = 100 / arrSum

  // /*
  //     [TR] Üyelerin sayılarının büyüklüklerine göre yüzdelik oranlarının
  //     belirlendiği coding işlemi yapılır. Burada üyelerin hangi aralıklarda
  //     yer alacağı belirlenir. Örneğin 1 - 2 - 3 - 4 - 5 sayıları yaklaşık
  //     %6.66 - %13.32 - %19,98 - %26,64 - %33,3 yüzdelik oranlarına sahip olur.
  // */
  // for (let i = 0; i < arr.length; i++) {
  //     let memberChance = parseInt(parseInt(arr[i], 2) * rouletteRatio)
  //     if (memberChance == 0) {
  //         memberChance = 1
  //     }
  //     arrRouletteRatio.push(arrRouletteRatioSum + memberChance)
  //     arrRouletteRatioSum += memberChance
  // }

  // /*
  //     [TR] Oluşturulan rulet oranlarına göre rastgele sayılar seçilerek
  //     hangi üyelerin seçileceği kararlaştırılır ve randomMembers arrayine
  //     eklenir.
  // */
  // for (let i = 0; i < crossingOverNumber; i++) {
  //     let randomNumber = Math.floor(Math.random() * 101)
  //     for (let j = 0; j < arr.length; j++) {
  //         if (
  //             (randomNumber < arrRouletteRatio[j + 1] &&
  //                 randomNumber > arrRouletteRatio[j] &&
  //                 j < arr.length - 1) ||
  //             randomNumber == arrRouletteRatio[j]
  //         ) {
  //             randomMembers.push(j)
  //             break
  //         } else if (
  //             j == arr.length - 1 &&
  //             randomNumber >= arrRouletteRatio[arr.length - 1]
  //         ) {
  //             randomMembers.push(arr.length - 1)
  //             break
  //         } else if (
  //             j == arr.length - 1 &&
  //             randomNumber < arrRouletteRatio[0]
  //         ) {
  //             randomMembers.push(0)
  //             break
  //         }
  //     }
  // }

  // /*
  //     [TR] Çaprazlama için seçilmiş üyeler karşılıklı olarak seçilir.
  //     ve çaprazlama işlemi gerçekleşir. Örneğin 0,1,2,3 numaralı
  //     üyeler için 0-3 ve 1-2 çarpazlaması yapılır.
  // */
  // for (let i = 0; i < randomMembers.length / 2; i++) {
  //     let temp = arr[randomMembers[i]].substring(randomCrossPoint)
  //     let temp2 =
  //         arr[randomMembers[randomMembers.length - i - 1]].substring(
  //             randomCrossPoint
  //         )

  //     let tempBeginning = arr[randomMembers[i]].substring(0, randomCrossPoint)
  //     let temp2Beginning = arr[
  //         randomMembers[randomMembers.length - i - 1]
  //     ].substring(0, randomCrossPoint)

  //     arr[randomMembers[i]] = tempBeginning + temp2
  //     arr[randomMembers[randomMembers.length - i - 1]] = temp2Beginning + temp
  // }
  // return arr
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

console.log(
  "En yakın mesafe:",
  Math.min(...populationFitnessScores),
  "En yakın mesafenin olduğu eleman:",
  populationFitnessScores.indexOf(Math.min(...populationFitnessScores)) + 1
);

crossingOver(crossingOverRatio, populationData, trophyCoordinates);
